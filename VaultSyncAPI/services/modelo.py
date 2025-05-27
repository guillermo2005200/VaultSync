import pandas as pd
import re
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from transformers import BertTokenizer, BertModel
import torch
from torch.nn.functional import normalize
from tqdm import tqdm

class ModeloComandosBERT:
    # Inicializa el modelo con el tokenizer de BERT, el modelo BERT y regresión logística
    def __init__(self, dataset_path):
        self.dataset_path = dataset_path
        self.tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
        self.bert = BertModel.from_pretrained("bert-base-uncased")
        self.modelo = LogisticRegression(max_iter=1000)
        self.entrenado = False

    # Limpia el texto de los comandos eliminando caracteres especiales y convirtiendo a minúsculas
    def limpiar_texto(self, texto):
        texto = texto.lower()
        texto = re.sub(r'\W+', ' ', texto)
        texto = re.sub(r'\s+', ' ', texto).strip()
        return texto
    # Vectoriza los textos utilizando BERT y normaliza los embeddings
    def vectorizar_bert(self, textos):
        embeddings = []
        self.bert.eval()
        with torch.no_grad():
            for texto in tqdm(textos, desc="Vectorizando con BERT"):
                inputs = self.tokenizer(texto, return_tensors="pt", truncation=True, padding=True)
                outputs = self.bert(**inputs)
                cls_embedding = outputs.last_hidden_state[:, 0, :]
                cls_embedding = normalize(cls_embedding, p=2, dim=1)
                embeddings.append(cls_embedding.squeeze().numpy())
        return embeddings

    # Carga el dataset, preprocesa los datos y divide en conjuntos de entrenamiento y prueba
    def cargar_y_preprocesar_datos(self):
        df = pd.read_csv(self.dataset_path, names=["comando_err", "comando_correcto"], header=None)
        df.dropna(inplace=True)
        df["comando_err_clean"] = df["comando_err"].apply(self.limpiar_texto)

        X = self.vectorizar_bert(df["comando_err_clean"].tolist())
        y = df["comando_correcto"].tolist()

        return train_test_split(X, y, test_size=0.1, random_state=1928)

    # Entrena el modelo de regresión logística con los datos preprocesados
    def entrenar(self):
        X_train, X_test, y_train, y_test = self.cargar_y_preprocesar_datos()
        self.modelo.fit(X_train, y_train)
        self.entrenado = True

        y_pred = self.modelo.predict(X_test)
        print("Resultados del modelo:")
        print("Precisión:", accuracy_score(y_test, y_pred))
        print("\nReporte de clasificación:")
        print(classification_report(y_test, y_pred))

    # Predice el comando correcto a partir de un comando erróneo
    def predecir(self, comando):
        if not self.entrenado:
            raise ValueError("El modelo no ha sido entrenado.")
        comando_clean = self.limpiar_texto(comando)
        embedding = self.vectorizar_bert([comando_clean])[0]
        return self.modelo.predict([embedding])[0]
