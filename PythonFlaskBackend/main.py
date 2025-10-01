from flask import Flask, jsonify
from serverless_wsgi import handle_request
import json
import random
import os
import glob

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/')
def home():
    try:
        # Load sets data for name mapping
        sets_file = os.path.join(os.path.dirname(__file__), 'pokemon-tcg-data-master', 'sets', 'en.json')
        with open(sets_file, 'r', encoding='utf-8') as f:
            sets_data = json.load(f)
        
        # Create a mapping of set ID to set name
        set_name_map = {set_info['id']: set_info['name'] for set_info in sets_data}
        
        # Get all JSON files in the cards directory
        cards_dir = os.path.join(os.path.dirname(__file__), 'pokemon-tcg-data-master', 'cards', 'en')
        json_files = glob.glob(os.path.join(cards_dir, '*.json'))
        
        if not json_files:
            return jsonify({"error": "No card data found"})
        
        # Pick a random JSON file
        random_file = random.choice(json_files)
        
        with open(random_file, 'r', encoding='utf-8') as f:
            cards_data = json.load(f)
        
        if not cards_data:
            return jsonify({"error": "No cards found in selected file"})
        
        # Filter cards that have flavor text
        cards_with_flavor = [card for card in cards_data if card.get("flavorText")]
        
        if not cards_with_flavor:
            return jsonify({"error": "No cards with flavor text found in selected file"})
        
        # Pick a random card from the filtered list
        random_card = random.choice(cards_with_flavor)
        
        # Extract set ID from card ID (e.g., "base1-2" -> "base1")
        card_id = random_card.get("id", "")
        set_id = card_id.split("-")[0] if "-" in card_id else card_id
        set_name = set_name_map.get(set_id, "Unknown")
        
        # Extract the required information
        result = {
            "card_name": random_card.get("name", "Unknown"),
            "set_name": set_name,
            "stage": random_card.get("subtypes", ["Unknown"])[0] if random_card.get("subtypes") else "Unknown",
            "type": random_card.get("types", ["Unknown"])[0] if random_card.get("types") else "Unknown",
            "attacks_abilities": [],
            "flavor_text": random_card.get("flavorText", "No flavor text available"),
            "image_urls": {
                "small": random_card.get("images", {}).get("small", ""),
                "large": random_card.get("images", {}).get("large", "")
            }
        }
        
        # Get attack names
        if random_card.get("attacks"):
            for attack in random_card["attacks"]:
                result["attacks_abilities"].append({
                    "name": attack.get("name", "Unknown Attack"),
                    "type": "attack"
                })
        
        # Get ability names
        if random_card.get("abilities"):
            for ability in random_card["abilities"]:
                result["attacks_abilities"].append({
                    "name": ability.get("name", "Unknown Ability"),
                    "type": "ability"
                })
        
        if not result["attacks_abilities"]:
            result["attacks_abilities"] = [{"name": "No attacks or abilities", "type": "none"}]
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"})

def lambda_handler(event, context):
    return handle_request(app, event, context)

# Run Locally
# if __name__ == '__main__':
#     app.run(debug=True)