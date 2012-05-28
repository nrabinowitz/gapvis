import json
import os

stub = json.load(open(os.path.join('places', 'books.json')))
book2 = json.load(open(os.path.join('books', '2.json')))
book3 = json.load(open(os.path.join('books', '3.json')))

overlap = [p2['id'] for p2 in book2['places']
           if p2['id'] in [p3['id'] for p3 in book3['places']]]
difference = [p['id'] for p in book2['places'] if p['id'] not in overlap]
difference += [p['id'] for p in book3['places'] if p['id'] not in overlap]

print overlap
print 'Found %d overlapping places' % len(overlap)
print 'Found %d different places' % len(difference)

for x, pid in enumerate(overlap + difference):
    dir = os.path.join('places', str(pid))
    data = stub if pid in overlap else []
    if not os.path.exists(dir):
        os.makedirs(dir)
    json.dump(data, open(os.path.join(dir, 'books.json'), 'w'))
    if x % 10:
        print '.',

print "Wrote %d files" % x




