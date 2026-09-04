import os

with open("d:/project-26/RoboMind/app/parent-mode.tsx", "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace('style={[{ height: \'94%\' } as any]}', 'style={{ height: "94%" as any }}')
with open("d:/project-26/RoboMind/app/parent-mode.tsx", "w", encoding="utf-8") as f:
    f.write(c)

with open("d:/project-26/RoboMind/app/rogue-soul.tsx", "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace('obs.type === ("saw" as any)', '(obs.type as any) === "saw"')
with open("d:/project-26/RoboMind/app/rogue-soul.tsx", "w", encoding="utf-8") as f:
    f.write(c)

with open("d:/project-26/RoboMind/components/Robot3DModelView.tsx", "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace('useLoader(MTLLoader, objUrl', '(useLoader as any)(MTLLoader, objUrl')
with open("d:/project-26/RoboMind/components/Robot3DModelView.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("Fixed final TS errors")
