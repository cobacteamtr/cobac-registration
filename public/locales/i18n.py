import json
import os

def load_translations():
    translations = {}
    # Get the directory where i18n.py is currently located (public/locales)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    for lang in ['en', 'tr']:
        path = os.path.join(current_dir, f'{lang}.json')
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                translations[lang] = json.load(f)
    return translations

if __name__ == "__main__":
    data = load_translations()
    print(f"Loaded languages successfully: {list(data.keys())}")
    
    # Bundle data and add the global t() function
    js_output = f"""window.TRANSLATIONS = {json.dumps(data, ensure_ascii=False, indent=2)};

window.currentLang = window.currentLang || 'tr';

window.t = function(key) {{
    const langData = window.TRANSLATIONS[window.currentLang] || {{}};
    return langData[key] || key;
}};
"""
    
    # Save translations.js one level up in the 'public' folder (alongside index.html)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(current_dir, '..', 'translations.js')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_output)
        
    print("Generated translations.js successfully in the public folder!")