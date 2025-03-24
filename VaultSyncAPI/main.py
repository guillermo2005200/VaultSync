from fastapi import FastAPI

app = FastAPI()

root_link = "api/v1"
@app.post(root_link+"/registrar")
async def registrar():
    return {"message": "Hello World"}


@app.get(root_link+"/iniciar")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
