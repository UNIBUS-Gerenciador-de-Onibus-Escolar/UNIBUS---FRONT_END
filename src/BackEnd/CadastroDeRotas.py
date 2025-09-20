from flask import Blueprint, request, jsonify
import mysql.connector
import uuid
import traceback

# Blueprint do módulo de rotas
rotas_bp = Blueprint('rotas_bp', __name__)

# Função para conectar ao banco de dados
def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="051526",
        database="TccUnibus"
    )

# =====================================================
# ROTA: Cadastrar uma nova rota escolar
# =====================================================
@rotas_bp.route("/cadastrar", methods=["POST"])
def cadastrar_rota():
    data = request.json

    try:
        conn = conectar()
        cursor = conn.cursor()

        # ID único da rota
        id_rota = str(uuid.uuid4())

        # PONTOS DE PARADA: garante que seja lista de strings
        pontos = data.get("pontos_parada", [])
        if isinstance(pontos, str):
            pontos = [p.strip() for p in pontos.split(",") if p.strip()]
        pontos_serializados = ",".join(pontos)

        # Inserindo a rota no banco
        cursor.execute("""
            INSERT INTO rotas (
                id, nome_rota, numero_onibus, placa_veiculo,
                turno, motorista_nome, motorista_telefone,
                horario_saida_casa, horario_chegada_escola,
                horario_saida_escola, horario_chegada_casa,
                pontos_parada, observacoes
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            id_rota,
            data.get("nome_rota"),
            data.get("numero_onibus"),
            data.get("placa_veiculo"),
            data.get("turno"),
            data.get("motorista_nome"),
            data.get("motorista_telefone"),
            data.get("horario_saida_casa"),
            data.get("horario_chegada_escola"),
            data.get("horario_saida_escola"),
            data.get("horario_chegada_casa"),
            pontos_serializados,
            data.get("observacoes")
        ))

        conn.commit()

        return jsonify({"mensagem": "Rota cadastrada com sucesso!", "id_rota": id_rota}), 201

    except Exception as erro:
        traceback.print_exc()
        return jsonify({"erro": str(erro)}), 400

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


# =====================================================
# ROTA: Listar todas as rotas
# =====================================================
@rotas_bp.route("/listar", methods=["GET"])
def listar_rotas():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM rotas")
        rotas = cursor.fetchall()

        # Converter pontos de parada em lista
        for rota in rotas:
            if rota.get("pontos_parada"):
                rota["pontos_parada"] = [p.strip() for p in rota["pontos_parada"].split(",") if p.strip()]

        return jsonify(rotas), 200

    except Exception as erro:
        traceback.print_exc()
        return jsonify({"erro": str(erro)}), 400

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


# Função auxiliar para gerar coordenadas fictícias a partir do nome
def coordenadas_por_nome(nome):
    base_lat = -8.28179
    base_lng = -35.99857
    offset = hash(nome) % 100 / 10000
    return base_lat + offset, base_lng + offset


# =====================================================
# ROTA: Detalhes da rota para um estudante
# =====================================================
@rotas_bp.route("/detalhes/<id_rota>/<id_estudante>", methods=["GET"])
def detalhes_rota(id_rota, id_estudante):
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        # Buscar rota
        cursor.execute("SELECT * FROM rotas WHERE id = %s", (id_rota,))
        rota = cursor.fetchone()
        if not rota:
            return jsonify({"erro": "Rota não encontrada"}), 404

        # Transformar pontos em lista
        pontos = rota.get("pontos_parada") or ""
        pontos_lista = [p.strip() for p in pontos.split(",") if p.strip()]

        # Buscar escola do estudante
        cursor.execute("SELECT escola FROM estudantes WHERE id = %s", (id_estudante,))
        estudante = cursor.fetchone()
        escola_nome = estudante.get("escola") if estudante else None

        # Adiciona a escola do estudante apenas se não estiver na lista
        if escola_nome and escola_nome not in pontos_lista:
            pontos_lista.append(escola_nome)

        # Criar lista de paradas com coordenadas e tipos corretos
        pontos_com_coord = []
        for idx, nome in enumerate(pontos_lista):
            latitude, longitude = coordenadas_por_nome(nome)
            if idx == 0:
                tipo = "origin"
            elif idx == len(pontos_lista) - 1:
                tipo = "destination"
            else:
                tipo = "stop"
            pontos_com_coord.append({
                "id": idx + 1,
                "name": nome,
                "type": tipo,
                "latitude": latitude,
                "longitude": longitude
            })

        rota["pontos_parada"] = pontos_com_coord
        rota["destino_escola"] = {
            "nome": escola_nome,
            "latitude": pontos_com_coord[-1]["latitude"] if pontos_com_coord else None,
            "longitude": pontos_com_coord[-1]["longitude"] if pontos_com_coord else None
        }

        return jsonify(rota), 200

    except Exception as erro:
        traceback.print_exc()
        return jsonify({"erro": str(erro)}), 400

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
