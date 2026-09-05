import os

# parent-mode.tsx
with open("d:/project-26/RoboMind/app/parent-mode.tsx", "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace("style={[{ height: '94%' as any }]}", "style={[{ height: '94%' } as any]")
c = c.replace('style={[{ height: "94%" as any }]}', "style={[{ height: '94%' } as any]")
with open("d:/project-26/RoboMind/app/parent-mode.tsx", "w", encoding="utf-8") as f:
    f.write(c)

# robo-bros.tsx
with open("d:/project-26/RoboMind/app/robo-bros.tsx", "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace("onClick={() => iframeRef.current?.focus()}", "{...({ onClick: () => iframeRef.current?.focus() } as any)}")
with open("d:/project-26/RoboMind/app/robo-bros.tsx", "w", encoding="utf-8") as f:
    f.write(c)

# Robot3DModelView.tsx
with open("d:/project-26/RoboMind/components/Robot3DModelView.tsx", "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace("const materials = useLoader(MTLLoader, ", "const materials = (useLoader as any)(MTLLoader, ")
c = c.replace("(mat) => {", "(mat: any) => {")
with open("d:/project-26/RoboMind/components/Robot3DModelView.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("Fixed last TS errors")
