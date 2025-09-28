from flask import Blueprint, request, jsonify
import mysql.connector
import uuid

inscricoes_bp = Blueprint('inscricoes_bp', __name__, url_prefix="/inscricaoEstudante")

def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="neto2007",
        database="UNIBUS"
    )

# =====================================================
# Inscrever estudante em uma rota
# =====================================================
@inscricoes_bp.route("/inscrever", methods=["POST"])
def inscrever_estudante():
    data = request.json
    estudante_id = data.get("estudante_id")
    rota_id = data.get("rota_id")

    if not estudante_id or not rota_id:
        return jsonify({"erro": "Estudante e rota são obrigatórios"}), 400

    conn = conectar()
    cursor = conn.cursor()

    try:
        # Verifica se já existe inscrição ativa
        cursor.execute(
            "SELECT * FROM inscricoes_rotas WHERE estudante_id = %s AND rota_id = %s AND status = 'ativa'",
            (estudante_id, rota_id)
        )
        if cursor.fetchone():
            return jsonify({"erro": "Estudante já inscrito nesta rota"}), 400

        # Inserir sem o campo 'id', pois é auto-increment
        cursor.execute("""
            INSERT INTO inscricoes_rotas (estudante_id, rota_id)
            VALUES (%s, %s)
        """, (estudante_id, rota_id))
        conn.commit()
        return jsonify({"mensagem": "Inscrição realizada com sucesso!"}), 201

    except mysql.connector.Error as erro:
        return jsonify({"erro": str(erro)}), 400

    finally:
        cursor.close()
        conn.close()

# =====================================================
# Remover inscrição do estudante
# =====================================================
@inscricoes_bp.route("/remover", methods=["DELETE"])
def remover_inscricao():
    estudante_id = request.args.get("estudante_id")
    rota_id = request.args.get("rota_id")

    if not estudante_id or not rota_id:
        return jsonify({"erro": "Estudante e rota são obrigatórios"}), 400

    conn = conectar()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "DELETE FROM inscricoes_rotas WHERE estudante_id = %s AND rota_id = %s",
            (estudante_id, rota_id)
        )
        conn.commit()
        return jsonify({"mensagem": "Inscrição removida com sucesso!"}), 200

    except mysql.connector.Error as erro:
        return jsonify({"erro": str(erro)}), 400

    finally:
        cursor.close()
        conn.close()

# =====================================================
# Listar estudantes inscritos em uma rota
# =====================================================
@inscricoes_bp.route("/listar/<rota_id>", methods=["GET"])
def listar_inscritos(rota_id):
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT e.id, e.nome_completo, e.escola, e.turma, e.numero_matricula
            FROM inscricoes_rotas i
            JOIN estudantes e ON i.estudante_id = e.id
            WHERE i.rota_id = %s
        """, (rota_id,))
        inscritos = cursor.fetchall()
        return jsonify(inscritos), 200
    except mysql.connector.Error as erro:
        return jsonify({"erro": str(erro)}), 400
    finally:
        cursor.close()
        conn.close()


# =====================================================
# Listar todas as rotas em que um estudante está inscrito
# =====================================================
@inscricoes_bp.route("/listar_rotas_estudante/<estudante_id>", methods=["GET"])
def listar_rotas_estudante(estudante_id):
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT r.*
            FROM inscricoes_rotas i
            JOIN rotas r ON i.rota_id = r.id
            WHERE i.estudante_id = %s AND i.status = 'ativa'
        """, (estudante_id,))
        rotas = cursor.fetchall()

        # Converter pontos de parada de string para lista
        for rota in rotas:
            if rota.get("pontos_parada"):
                rota["pontos_parada"] = rota["pontos_parada"].split(",")

        return jsonify(rotas), 200
    except mysql.connector.Error as erro:
        return jsonify({"erro": str(erro)}), 400
    finally:
        cursor.close()
        conn.close()
