from flask import Blueprint, request, jsonify
import mysql.connector
import traceback
from werkzeug.security import generate_password_hash, check_password_hash

gestao_bp = Blueprint("gestao_bp", __name__)

# Conexão com o banco
def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="neto2007",
        database="UNIBUS"
    )

# =====================================================
# Cadastrar gestão escolar
# =====================================================
@gestao_bp.route("/cadastrar", methods=["POST"])
def cadastrar_gestao():
    data = request.json
    try:
        conn = conectar()
        cursor = conn.cursor()
        senha_hash = generate_password_hash(data.get("senha"))

        cursor.execute("""
            INSERT INTO gestao (
                nome_escola, endereco, latitude, longitude, contato_escola,
                nome_gestor, cargo, email_gestor, telefone_gestor, senha
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            data.get("nome_escola"),
            data.get("endereco"),
            data.get("latitude"),
            data.get("longitude"),
            data.get("contato_escola") or "",
            data.get("nome_gestor"),
            data.get("cargo") or "",
            data.get("email_gestor"),
            data.get("telefone_gestor") or "",
            senha_hash
        ))
        conn.commit()
        cursor.execute("SELECT LAST_INSERT_ID() AS id")
        gestao_id = cursor.fetchone()[0]

        return jsonify({
            "mensagem": "Gestão cadastrada com sucesso!",
            "id": gestao_id
        }), 201

    except mysql.connector.IntegrityError as ie:
        traceback.print_exc()
        return jsonify({"erro": "Email já cadastrado.", "detalhe": str(ie)}), 409
    except Exception as erro:
        traceback.print_exc()
        return jsonify({"erro": str(erro)}), 400
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# =====================================================
# Login gestão escolar
# =====================================================
@gestao_bp.route("/login", methods=["POST"])
def login_gestao():
    data = request.json
    email = data.get("email")
    senha = data.get("senha")
    if not email or not senha:
        return jsonify({"erro": "Email e senha são obrigatórios"}), 400

    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        # Alteração aqui: coluna correta no banco
        cursor.execute("SELECT * FROM gestao WHERE email_gestor=%s", (email,))
        gestao = cursor.fetchone()

        if gestao and check_password_hash(gestao["senha"], senha):
            gestao.pop("senha", None)
            return jsonify(gestao), 200
        else:
            return jsonify({"erro": "Email ou senha inválidos"}), 401
    except Exception as erro:
        traceback.print_exc()
        return jsonify({"erro": str(erro)}), 400
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# =====================================================
# Listar gestões
# =====================================================
@gestao_bp.route("/listar", methods=["GET"])
def listar_gestao():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM gestao")
        gestoes = cursor.fetchall()
        return jsonify(gestoes), 200
    except Exception as erro:
        traceback.print_exc()
        return jsonify({"erro": str(erro)}), 400
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()
