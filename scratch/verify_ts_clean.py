import subprocess

res = subprocess.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True, shell=True)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
print("EXIT CODE:", res.returncode)
