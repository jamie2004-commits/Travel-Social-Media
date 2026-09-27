"""Build prototype trip data from the supplied itinerary, excluding booking credentials."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def text(self):
        return ' '.join(' '.join(c.text() if isinstance(c, Node) else c for c in self.children).split())

    def find(self, tag=None, cls=None):
        found = []
        for c in self.children:
            if isinstance(c, Node):
                if (tag is None or c.tag == tag) and (cls is None or cls in c.attrs.get('class', '').split()):
                    found.append(c)
                found.extend(c.find(tag, cls))
        return found

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.root = Node()
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in {'meta', 'link', 'br', 'hr', 'img', 'input'}:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)

def clean(text):
    text = re.sub(r'\s*·?\s*Ref\b.*', '', text, flags=re.I)
    text = re.sub(r'Eticket for .*?(?=Eticket for |$)', '', text, flags=re.I)
    return text.strip()

def field(node, cls):
    matches = node.find(cls=cls)
    return clean(matches[0].text()) if matches else ''

parser = Parser()
parser.feed((ROOT / '杭州-上海 (10).html').read_text(encoding='utf-8'))
trip = dict(id='hangzhou-shanghai-2026', title='杭州 / 上海 · A week together', place='Hangzhou & Shanghai, China',
            author='Jamie', days=7, departureDate='2026-09-17', endDate='2026-09-24', image='china',
            status='Planned', own=True, visibility='private', imported=True, timezone='Asia/Shanghai',
            schedule=[], stops=[], transport=[], hotels=[], expenses=[])
for day in parser.root.find('section', 'day'):
    label = day.find(cls='daynum')[0]
    date = label.find('span')[0].text()
    number = int(day.attrs['id'][1:])
    trip['schedule'].append(dict(day=number, date=date, title=field(day, 'label'),
                                 estimate=field(day, 'daycost'), stay=field(day, 'staynight')))
    for stop in day.find('li'):
        trip['stops'].append(dict(name=field(stop, 'what'), time=field(stop, 'time'), day=number,
                                  notes=[clean(n.text()) for n in stop.find(cls='note') if clean(n.text())],
                                  transport=field(stop, 'leg'), cost=field(stop, 'cost'), done=False))
for section in parser.root.find('section'):
    section_id = section.attrs.get('id')
    if section_id in {'travel', 'hotels'}:
        for item in section.find('li'):
            trip['transport' if section_id == 'travel' else 'hotels'].append(dict(
                name=clean(item.find('b')[0].text()), route=field(item, 'legroute'),
                day=field(item, 'legday'), time=field(item, 'legtime')))
    if section_id == 'spending':
        for row in section.find('tbody')[0].find('tr'):
            cells = [c.text() for c in row.find('td')]
            trip['expenses'].append(dict(date=cells[0], name=cells[1], category=cells[2], paid=cells[3],
                                         sgd=float(cells[4].replace('S$', '').replace(',', ''))))
assert len(trip['schedule']) == 8 and len(trip['stops']) == 30
assert round(sum(e['sgd'] for e in trip['expenses']), 2) == 1532.68
output = json.dumps(trip, ensure_ascii=False, indent=2)
assert not re.search(r'\bRef\b|Eticket|\bpin\b|\d{12,}', output, re.I)
(ROOT / 'prototype-trip.js').write_text('const importedTrip = ' + output + ';\n', encoding='utf-8')
print('Imported 8 dated sections, 30 stops, 4 hotels, 3 transport legs, and 7 expenses; booking credentials excluded.')
