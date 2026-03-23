import { NextResponse } from "next/server";
import { getAdminBookingByReference } from "@/lib/admin-data";
import {
  getBookingByCheckoutSessionId,
  getBookingByReference,
  hasSentBookingNotification,
  hasProcessedWebhook,
  markBookingNotificationSent,
  markWebhookProcessed,
  updateBookingPaymentState,
} from "@/lib/booking-db";
import {
  sendNewAppointmentCustomerNotification,
  sendNewAppointmentNotification,
} from "@/lib/booking-notifications";
import { verifyStripeWebhookSignature } from "@/lib/stripe";

export const runtime = "nodejs";

const NEW_BOOKING_CLINIC_NOTIFICATION_TYPE = "new_booking_paid_email";
const NEW_BOOKING_CUSTOMER_NOTIFICATION_TYPE = "new_booking_paid_customer_email";

export async function POST(request: Request) {
  const payload = await request.text();
  const signatureHeader = request.headers.get("Stripe-Signature");

  let event;
  try {
    event = verifyStripeWebhookSignature(payload, signatureHeader);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Stripe webhook verification failed.",
      },
      { status: 400 },
    );
  }

  if (await hasProcessedWebhook(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const session = event.data.object;
  const bookingReference = session.metadata?.booking_reference ?? null;
  const booking =
    (session.id ? await getBookingByCheckoutSessionId(session.id) : null) ??
    (bookingReference ? await getBookingByReference(bookingReference) : null);

  if (!booking) {
    await markWebhookProcessed(event.id);
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await updateBookingPaymentState({
        reference: booking.reference,
        bookingStatus: "pending_confirmation",
        paymentStatus: "paid",
        stripePaymentStatus: session.payment_status ?? "paid",
        stripePaymentIntentId: session.payment_intent ?? null,
        eventType: event.type,
        eventPayload: session,
      });

      if (
        !(await hasSentBookingNotification(
          booking.reference,
          NEW_BOOKING_CLINIC_NOTIFICATION_TYPE,
        ))
      ) {
        const detailedBooking = await getAdminBookingByReference(booking.reference);

        if (!detailedBooking) {
          throw new Error(`Booking ${booking.reference} could not be loaded for email notification.`);
        }

        await sendNewAppointmentNotification(detailedBooking);
        await markBookingNotificationSent(
          booking.reference,
          NEW_BOOKING_CLINIC_NOTIFICATION_TYPE,
        );
      }

      if (
        !(await hasSentBookingNotification(
          booking.reference,
          NEW_BOOKING_CUSTOMER_NOTIFICATION_TYPE,
        ))
      ) {
        const detailedBooking = await getAdminBookingByReference(booking.reference);

        if (!detailedBooking) {
          throw new Error(
            `Booking ${booking.reference} could not be loaded for customer email notification.`,
          );
        }

        await sendNewAppointmentCustomerNotification(detailedBooking);
        await markBookingNotificationSent(
          booking.reference,
          NEW_BOOKING_CUSTOMER_NOTIFICATION_TYPE,
        );
      }
    } else if (event.type === "checkout.session.expired") {
      await updateBookingPaymentState({
        reference: booking.reference,
        bookingStatus: "deposit_expired",
        paymentStatus: "expired",
        stripePaymentStatus: session.payment_status ?? "expired",
        stripePaymentIntentId: session.payment_intent ?? null,
        eventType: event.type,
        eventPayload: session,
      });
    } else if (event.type === "checkout.session.async_payment_failed") {
      await updateBookingPaymentState({
        reference: booking.reference,
        bookingStatus: "deposit_failed",
        paymentStatus: "failed",
        stripePaymentStatus: session.payment_status ?? "failed",
        stripePaymentIntentId: session.payment_intent ?? null,
        eventType: event.type,
        eventPayload: session,
      });
    }

    await markWebhookProcessed(event.id);
  } catch (error) {
    console.error("Stripe webhook handling failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe webhook handling failed.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
