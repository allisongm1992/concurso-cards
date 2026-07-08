import os, glob, genanki, random

output_dir = r'C:\Users\allis\concurso-cards\export-apkg'
os.makedirs(output_dir, exist_ok=True)

data_dir = r'C:\Users\allis\concurso-cards\src\data'

# Anki model (card template)
model = genanki.Model(
    1607392319,
    'Concurso Cards',
    fields=[
        {'name': 'Front'},
        {'name': 'Back'},
    ],
    templates=[
        {
            'name': 'Card 1',
            'qfmt': '{{Front}}',
            'afmt': '{{FrontSide}}<hr id="answer">{{Back}}',
        },
    ]
)

def extract_cards(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    cards = []
    i = 0
    while i < len(content):
        front_idx = content.find('front:', i)
        if front_idx == -1:
            break

        q1 = content.find('"', front_idx + 6)
        if q1 == -1:
            break

        j = q1 + 1
        while j < len(content):
            if content[j] == '\\' and j + 1 < len(content):
                j += 2
                continue
            if content[j] == '"':
                break
            j += 1
        front_text = content[q1+1:j]

        back_idx = content.find('back:', j)
        if back_idx == -1:
            break

        q2 = content.find('"', back_idx + 5)
        if q2 == -1:
            break

        k = q2 + 1
        while k < len(content):
            if content[k] == '\\' and k + 1 < len(content):
                k += 2
                continue
            if content[k] == '"':
                break
            k += 1
        back_text = content[q2+1:k]

        front_text = front_text.replace('\\"', '"').replace('\\n', ' ').replace('\n', ' ')
        back_text = back_text.replace('\\"', '"').replace('\\n', ' ').replace('\n', ' ')

        cards.append((front_text, back_text))
        i = k + 1

    return cards


# Generate one .apkg per deck
for filepath in sorted(glob.glob(os.path.join(data_dir, 'cards-*.ts'))):
    cards = extract_cards(filepath)
    if not cards:
        continue

    basename = os.path.basename(filepath).replace('.ts', '')
    deck_name = basename.replace('cards-', '').replace('-', ' ').upper()
    deck_id = random.randrange(1 << 30, 1 << 31)

    deck = genanki.Deck(deck_id, f'Concurso Cards::{deck_name}')

    for front, back in cards:
        note = genanki.Note(model=model, fields=[front, back])
        deck.add_note(note)

    output_path = os.path.join(output_dir, f'{basename}.apkg')
    genanki.Package(deck).write_to_file(output_path)
    print(f'{basename}.apkg: {len(cards)} cards')

# Also generate one big combined .apkg
print('\nGenerating combined deck...')
combined_deck = genanki.Deck(1234567890, 'Concurso Cards - Completo')
for filepath in sorted(glob.glob(os.path.join(data_dir, 'cards-*.ts'))):
    cards = extract_cards(filepath)
    for front, back in cards:
        note = genanki.Note(model=model, fields=[front, back])
        combined_deck.add_note(note)

combined_path = os.path.join(output_dir, 'concurso-cards-completo.apkg')
genanki.Package(combined_deck).write_to_file(combined_path)
print(f'concurso-cards-completo.apkg: {combined_deck.notes.__len__()} cards total')

print(f'\nAll .apkg files saved to: {output_dir}')
