from flask import Blueprint, request, jsonify
import mysql.connector
import traceback
import json

# Blueprint do módulo de rotas
rotas_bp = Blueprint('rotas_bp', __name__)

# Função para conectar ao banco de dados
def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="051526",
        database="UNIBUS"
    )

# =====================================================
# ROTA: Cadastrar uma nova rota escolar (sem capacidade)
# =====================================================
@rotas_bp.route("/cadastrar", methods=["POST"])
def cadastrar_rota():
    data = request.json

    try:
        conn = conectar()
        cursor = conn.cursor()

        # PONTOS DE PARADA: lista de objetos {name, latitude, longitude, horario}
        pontos = data.get("pontos_parada", [])
        pontos_serializados = json.dumps(pontos)  # Salva como JSON no banco

        # Inserindo a rota no banco (id é auto incremento, não passamos mais)
        cursor.execute("""
            INSERT INTO rotas (
                nome_rota, numero_onibus, placa_veiculo,
                turno, motorista_nome, motorista_telefone,
                horario_saida_casa, horario_chegada_escola,
                horario_saida_escola, horario_chegada_casa,
                pontos_parada, observacoes
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
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
        # Pega o id gerado automaticamente
        id_rota = cursor.lastrowid

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
# ROTA: Listar todas as rotas (atualizada)
# =====================================================
@rotas_bp.route("/listar", methods=["GET"])
def listar_rotas():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM rotas")
        rotas = cursor.fetchall()

        # Converter pontos de parada de JSON para lista de objetos
        for rota in rotas:
            if rota.get("pontos_parada"):
                try:
                    rota["pontos_parada"] = json.loads(rota["pontos_parada"])
                except:
                    rota["pontos_parada"] = []

        return jsonify(rotas), 200

    except Exception as erro:
        traceback.print_exc()
        return jsonify({"erro": str(erro)}), 400

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


# Função auxiliar para gerar coordenadas fictícias a partir do nome (para testes)
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

        # Transformar pontos em lista de objetos
        pontos = rota.get("pontos_parada") or "[]"
        try:
            pontos_lista = json.loads(pontos)
        except:
            pontos_lista = []

        # Buscar escola do estudante
        cursor.execute("SELECT escola FROM estudantes WHERE id = %s", (id_estudante,))
        estudante = cursor.fetchone()
        escola_nome = estudante.get("escola") if estudante else None

        # Adiciona a escola do estudante como destino se não estiver na lista
        if escola_nome and not any(p.get("name") == escola_nome for p in pontos_lista):
            lat, lng = coordenadas_por_nome(escola_nome)
            pontos_lista.append({
                "id": len(pontos_lista)+1,
                "name": escola_nome,
                "type": "destination",
                "latitude": lat,
                "longitude": lng,
                "horario": None
            })

        # Define tipos das paradas (origin, stop, destination)
        for idx, ponto in enumerate(pontos_lista):
            if "type" not in ponto or not ponto["type"]:
                if idx == 0:
                    ponto["type"] = "origin"
                elif idx == len(pontos_lista) - 1:
                    ponto["type"] = "destination"
                else:
                    ponto["type"] = "stop"
            ponto["id"] = idx + 1

        rota["pontos_parada"] = pontos_lista
        rota["destino_escola"] = {
            "nome": escola_nome,
            "latitude": pontos_lista[-1]["latitude"] if pontos_lista else None,
            "longitude": pontos_lista[-1]["longitude"] if pontos_lista else None
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
