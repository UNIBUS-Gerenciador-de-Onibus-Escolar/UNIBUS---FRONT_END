from flask import Blueprint, request, jsonify
import mysql.connector
import traceback
from werkzeug.security import generate_password_hash, check_password_hash

motoristas_bp = Blueprint("motoristas_bp", __name__)

# =====================================================
# Função para conectar ao MySQL
# =====================================================
def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="051526",
        database="UNIBUS"
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

        # Validação de email
        if not data.get("email"):
            return jsonify({"erro": "O campo email é obrigatório"}), 400

        # Gera hash da senha (usa padrão 123456 se não enviada)
        senha_raw = data.get("senha") or "123456"
        senha_hash = generate_password_hash(senha_raw)

        cursor.execute("""
            INSERT INTO motoristas (
                nome_completo, email, senha, telefone,
                placa_onibus, rota, foto_perfil
            ) VALUES (%s,%s,%s,%s,%s,%s,%s)
        """, (
            data.get("nome_completo"),
            data.get("email"),
            senha_hash,
            data.get("telefone"),
            data.get("placa_onibus"),
            data.get("rota"),
            data.get("foto_perfil", "")
        ))
        conn.commit()

        # pega o id gerado automaticamente
        novo_id = cursor.lastrowid

        return jsonify({
            "mensagem": "Motorista cadastrado com sucesso!",
            "id": novo_id
        }), 201

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
@motoristas_bp.route("/atualizar/<int:id_motorista>", methods=["PUT"])
def atualizar_motorista(id_motorista):
    data = request.json
    try:
        conn = conectar()
        cursor = conn.cursor()

        # Se senha for enviada, gera hash. Se não, mantém a senha atual no banco.
        if data.get("senha"):
            senha_hash = generate_password_hash(data.get("senha"))
        else:
            cursor.execute("SELECT senha FROM motoristas WHERE id=%s", (id_motorista,))
            senha_atual = cursor.fetchone()
            senha_hash = senha_atual[0] if senha_atual else None

        cursor.execute("""
            UPDATE motoristas
            SET nome_completo=%s,
                email=%s,
                telefone=%s,
                senha=%s,
                placa_onibus=%s,
                rota=%s,
                foto_perfil=%s
            WHERE id=%s
        """, (
            data.get("nome_completo"),
            data.get("email"),
            data.get("telefone"),
            senha_hash,
            data.get("placa_onibus"),
            data.get("rota"),
            data.get("foto_perfil", ""),
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


# =====================================================
# Login do motorista
# =====================================================
@motoristas_bp.route("/login", methods=["POST"])
def login_motorista():
    data = request.json
    try:
        email = data.get("email")
        senha = data.get("senha")

        if not email or not senha:
            return jsonify({"erro": "Email e senha são obrigatórios"}), 400

        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM motoristas WHERE email=%s", (email,))
        motorista = cursor.fetchone()

        if not motorista:
            return jsonify({"erro": "Email não encontrado"}), 401

        # valida a senha
        if not check_password_hash(motorista["senha"], senha):
            return jsonify({"erro": "Senha incorreta"}), 401

        # remove a senha do retorno
        motorista.pop("senha", None)

        return jsonify({"mensagem": "Login realizado com sucesso!", "motorista": motorista}), 200

    except Exception as erro:
        traceback.print_exc()
        return jsonify({"erro": str(erro)}), 400
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()
