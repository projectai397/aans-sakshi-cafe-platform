"""
Rasa Custom Actions for Sakshi Cafe Chatbot
Handles API calls and business logic
"""

from typing import Any, Text, Dict, List
from rasa_sdk import Action, FormValidationAction
from rasa_sdk.events import SlotSet
import requests
import json
from datetime import datetime

# API Configuration
AANS_API_URL = "http://localhost:3000/api"

class ActionConfirmReservation(Action):
    """Confirm table reservation"""
    
    def name(self) -> Text:
        return "action_confirm_reservation"

    def run(
        self,
        dispatcher,
        tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        party_size = tracker.get_slot("party_size")
        date = tracker.get_slot("date")
        time = tracker.get_slot("time")
        name = tracker.get_slot("name")

        try:
            response = requests.post(
                f"{AANS_API_URL}/reservations",
                json={
                    "name": name,
                    "party_size": int(party_size) if party_size else 2,
                    "date": date,
                    "time": time,
                },
                timeout=5
            )

            if response.status_code == 201:
                reservation = response.json()
                dispatcher.utter_message(
                    text=f"Perfect! I've booked a table for {party_size} on {date} at {time}. "
                    f"Your reservation ID is {reservation.get('id')}. "
                    f"We look forward to seeing you!"
                )
            else:
                dispatcher.utter_message(
                    text="Sorry, I couldn't complete your reservation. Please try again or call us directly."
                )
        except Exception as e:
            dispatcher.utter_message(
                text=f"Sorry, something went wrong: {str(e)}. Please call us at +91-XXXX-XXXX"
            )

        return []


class ActionGetMenuItems(Action):
    """Retrieve menu items based on preferences"""
    
    def name(self) -> Text:
        return "action_get_menu_items"

    def run(
        self,
        dispatcher,
        tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        dietary_preference = tracker.get_slot("dietary_preference")
        cuisine_type = tracker.get_slot("cuisine_type")

        try:
            params = {}
            if dietary_preference:
                params["dietary"] = dietary_preference
            if cuisine_type:
                params["category"] = cuisine_type

            response = requests.get(
                f"{AANS_API_URL}/menu-items",
                params=params,
                timeout=5
            )

            if response.status_code == 200:
                items = response.json().get("items", [])
                if items:
                    menu_text = "Here are our available items:\n\n"
                    for item in items[:5]:
                        menu_text += f"• {item.get('name')} - ₹{item.get('price')}\n"
                        if item.get('description'):
                            menu_text += f"  {item.get('description')}\n"
                    dispatcher.utter_message(text=menu_text)
                else:
                    dispatcher.utter_message(
                        text="Sorry, no items match your preferences. Would you like to see our full menu?"
                    )
            else:
                dispatcher.utter_message(
                    text="Sorry, I couldn't retrieve the menu. Please try again."
                )
        except Exception as e:
            dispatcher.utter_message(
                text=f"Sorry, something went wrong: {str(e)}"
            )

        return []


class ActionAddToCart(Action):
    """Add item to cart"""
    
    def name(self) -> Text:
        return "action_add_to_cart"

    def run(
        self,
        dispatcher,
        tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        item_name = tracker.get_slot("item_name")
        quantity = tracker.get_slot("quantity") or "1"

        try:
            # In real implementation, would add to actual cart
            dispatcher.utter_message(
                text=f"Added {quantity} {item_name}(s) to your cart!"
            )
        except Exception as e:
            dispatcher.utter_message(
                text=f"Sorry, couldn't add item to cart: {str(e)}"
            )

        return []


class ActionProcessOrder(Action):
    """Process and create order"""
    
    def name(self) -> Text:
        return "action_process_order"

    def run(
        self,
        dispatcher,
        tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        name = tracker.get_slot("name")
        phone = tracker.get_slot("phone")
        address = tracker.get_slot("address")
        delivery_type = tracker.get_slot("delivery_type")
        payment_method = tracker.get_slot("payment_method")
        items = tracker.get_slot("items") or []

        try:
            response = requests.post(
                f"{AANS_API_URL}/orders",
                json={
                    "customer_name": name,
                    "customer_phone": phone,
                    "delivery_type": delivery_type,
                    "address": address if delivery_type == "delivery" else None,
                    "payment_method": payment_method,
                    "items": items,
                },
                timeout=5
            )

            if response.status_code == 201:
                order = response.json()
                dispatcher.utter_message(
                    text=f"Excellent! Your order has been placed. "
                    f"Order ID: {order.get('id')}\n"
                    f"Estimated time: {order.get('estimated_time')} minutes\n"
                    f"We'll notify you when it's ready!"
                )
            else:
                dispatcher.utter_message(
                    text="Sorry, I couldn't process your order. Please try again."
                )
        except Exception as e:
            dispatcher.utter_message(
                text=f"Sorry, something went wrong: {str(e)}"
            )

        return []


class ActionGetOrderStatus(Action):
    """Get current order status"""
    
    def name(self) -> Text:
        return "action_get_order_status"

    def run(
        self,
        dispatcher,
        tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        order_id = tracker.get_slot("order_id")

        if not order_id:
            dispatcher.utter_message(
                text="I need your order ID to track your order. "
                "Could you please provide it?"
            )
            return []

        try:
            response = requests.get(
                f"{AANS_API_URL}/orders/{order_id}",
                timeout=5
            )

            if response.status_code == 200:
                order = response.json()
                status_emoji = {
                    "pending": "⏳",
                    "confirmed": "✅",
                    "preparing": "👨‍🍳",
                    "ready": "📦",
                    "delivered": "🚚",
                    "cancelled": "❌"
                }
                emoji = status_emoji.get(order.get('status'), "📍")
                
                dispatcher.utter_message(
                    text=f"{emoji} Your order status: {order.get('status')}\n"
                    f"Estimated time: {order.get('estimated_time')} minutes"
                )
            else:
                dispatcher.utter_message(
                    text="Sorry, I couldn't find your order. Please check the order ID."
                )
        except Exception as e:
            dispatcher.utter_message(
                text=f"Sorry, something went wrong: {str(e)}"
            )

        return []


class ActionSaveFeedback(Action):
    """Save customer feedback"""
    
    def name(self) -> Text:
        return "action_save_feedback"

    def run(
        self,
        dispatcher,
        tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        # Get feedback from latest message
        latest_message = tracker.latest_message.get("text", "")

        try:
            response = requests.post(
                f"{AANS_API_URL}/feedback",
                json={
                    "message": latest_message,
                    "timestamp": datetime.now().isoformat(),
                },
                timeout=5
            )

            if response.status_code == 201:
                dispatcher.utter_message(
                    text="Thank you for your feedback! It helps us improve our service."
                )
            else:
                dispatcher.utter_message(
                    text="Thank you for your feedback!"
                )
        except Exception as e:
            dispatcher.utter_message(
                text="Thank you for your feedback!"
            )

        return []


class ActionProvideContactInfo(Action):
    """Provide contact information"""
    
    def name(self) -> Text:
        return "action_provide_contact_info"

    def run(
        self,
        dispatcher,
        tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        try:
            response = requests.get(
                f"{AANS_API_URL}/cafe/contact-info",
                timeout=5
            )

            if response.status_code == 200:
                contact = response.json()
                dispatcher.utter_message(
                    text=f"📞 Phone: {contact.get('phone')}\n"
                    f"📧 Email: {contact.get('email')}\n"
                    f"📍 Address: {contact.get('address')}\n"
                    f"⏰ Hours: {contact.get('hours')}"
                )
            else:
                dispatcher.utter_message(
                    text="📞 Phone: +91-XXXX-XXXX\n"
                    f"📧 Email: hello@sakshicafe.com\n"
                    f"📍 Address: [Cafe Address]\n"
                    f"⏰ Hours: 10 AM - 10 PM"
                )
        except Exception as e:
            dispatcher.utter_message(
                text="📞 Phone: +91-XXXX-XXXX\n"
                f"📧 Email: hello@sakshicafe.com"
            )

        return []
