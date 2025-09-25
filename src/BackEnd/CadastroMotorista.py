from flask import Blueprint, request, jsonify
import mysql.connector
import uuid
import traceback

motoristas_bp = Blueprint("motoristas_bp", __name__)

# Função para conectar ao MySQL
def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="neto2007",
        database="TccUnibus"
    )

# =====================================================
# Cadastrar motorista
# =====================================================
@motoristas_bp.route("/cadastrar", methods=["POST"])
def cadastrar_motorista():
    data = request.json
    try:
        conn = conectar()
        cursor = conn.cursor()
        id_motorista = str(uuid.uuid4())

        cursor.execute("""
            INSERT INTO motoristas (
                id, nome_completo, email, telefone, senha,
                cnh, validade_cnh, placa_onibus, modelo_onibus, rota, foto_perfil
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            id_motorista,
            data.get("nome_completo"),
            data.get("email"),
            data.get("telefone"),
            data.get("senha"),
            data.get("cnh"),
            data.get("validade_cnh"),
            data.get("placa_onibus"),
            data.get("modelo_onibus"),
            data.get("rota"),
            data.get("foto_perfil","")
        ))
        conn.commit()
        return jsonify({"mensagem": "Motorista cadastrado com sucesso!", "id": id_motorista}), 201

    except Exception as erro:
        traceback.print_exc()
        return jsonify({"erro": str(erro)}), 400

    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# =====================================================
# Listar motoristas
# =====================================================
@motoristas_bp.route("/listar", methods=["GET"])
def listar_motoristas():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM motoristas")
        motoristas = cursor.fetchall()
        return jsonify(motoristas), 200
    except Exception as erro:
        traceback.print_exc()
        return jsonify({"erro": str(erro)}), 400
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# =====================================================
# Atualizar motorista
# =====================================================
@motoristas_bp.route("/atualizar/<id_motorista>", methods=["PUT"])
def atualizar_motorista(id_motorista):
    data = request.json
    try:
        conn = conectar()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE motoristas
            SET nome_completo=%s, email=%s, telefone=%s, senha=%s,
                cnh=%s, validade_cnh=%s, placa_onibus=%s, modelo_onibus=%s,
                rota=%s, foto_perfil=%s
            WHERE id=%s
        """, (
            data.get("nome_completo"),
            data.get("email"),
            data.get("telefone"),
            data.get("senha"),
            data.get("cnh"),
            data.get("validade_cnh"),
            data.get("placa_onibus"),
            data.get("modelo_onibus"),
            data.get("rota"),
            data.get("foto_perfil",""),
            id_motorista
        ))
        conn.commit()
        return jsonify({"mensagem": "Motorista atualizado com sucesso!"}), 200

    except Exception as erro:
        traceback.print_exc()
        return jsonify({"erro": str(erro)}), 400
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()
