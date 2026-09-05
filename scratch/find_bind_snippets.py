import glob

js_files = glob.glob(r"d:\project-26\RoboMind\dist\_expo\static\js\web\*.js")
js_path = js_files[0]

with open(js_path, "r", encoding="utf-8") as f:
    content = f.read()

targets = ["O.encode", "O.decode", "c.addListener", "c.remeasure", "l.get"]

for t in targets:
    pos = content.find(t + ".bind(")
    if pos != -1:
        print(f"\n=================== TARGET: {t} ===================")
        print(content[max(0, pos-200):min(len(content), pos+300)])
