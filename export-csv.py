import os, glob

output_dir = r'C:\Users\allis\concurso-cards\export-csv'
os.makedirs(output_dir, exist_ok=True)

data_dir = r'C:\Users\allis\concurso-cards\src\data'

for filepath in sorted(glob.glob(os.path.join(data_dir, 'cards-*.ts'))):
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

    basename = os.path.basename(filepath).replace('.ts', '.csv')
    csv_path = os.path.join(output_dir, basename)

    with open(csv_path, 'w', encoding='utf-8') as f:
        f.write('front;back\n')
        for front, back in cards:
            front = front.replace(';', ',')
            back = back.replace(';', ',')
            f.write(f'{front};{back}\n')

    print(f'{basename}: {len(cards)} cards')

print(f'\nSaved to: {output_dir}')
