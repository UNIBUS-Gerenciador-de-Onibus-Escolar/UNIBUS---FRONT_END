# cadastroEstudante.py
from flask import Blueprint, request, jsonify
import mysql.connector
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

estudantes_bp = Blueprint("estudantes_bp", __name__)

def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="051526",
        database="UNIBUS"
    )

# =====================================================
# Cadastrar Estudante
# =====================================================
@estudantes_bp.route("/cadastro", methods=["POST"])
def cadastro():
    data = request.json or {}
    obrigatorios = ["nome_completo", "escola", "turma", "email",
                    "numero_matricula", "nome_responsavel", "numero_responsavel", "senha"]
    faltando = [c for c in obrigatorios if not data.get(c)]
    if faltando:
        return jsonify({"erro": f"Campos obrigatórios faltando: {', '.join(faltando)}"}), 400

    conn = conectar()
    cursor = conn.cursor()
    try:
        estudante_id = str(uuid.uuid4())
        profile_id = str(uuid.uuid4())
        senha_hash = generate_password_hash(data["senha"])

        # Criar profile
        cursor.execute("""
            INSERT INTO profiles (id, email, nome_completo, role)
            VALUES (%s, %s, %s, 'estudante')
        """, (profile_id, data["email"], data["nome_completo"]))

        # Criar estudante vinculado ao profile
        cursor.execute("""
            INSERT INTO estudantes (
                id, nome_completo, escola, turma, email,
                numero_matricula, nome_responsavel, numero_responsavel,
                senha, created_by, profile_id
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            estudante_id,
            data["nome_completo"],
            data["escola"],
            data["turma"],
            data["email"],
            data["numero_matricula"],
            data["nome_responsavel"],
            data["numero_responsavel"],
            senha_hash,
            data.get("created_by"),
            profile_id
        ))

        conn.commit()
        return jsonify({
            "mensagem": "Cadastro realizado com sucesso!",
            "estudante_id": estudante_id,
            "profile_id": profile_id
        }), 201

    except mysql.connector.IntegrityError as ie:
        print("IntegrityError:", ie)
        return jsonify({"erro": "Email ou número de matrícula já cadastrado.", "detalhe": str(ie)}), 409

    except mysql.connector.Error as erro:
        print("Erro no banco:", erro)
        return jsonify({"erro": "Erro no banco de dados.", "detalhe": str(erro)}), 500

    finally:
        cursor.close()
        conn.close()

# =====================================================
# Login Estudante
# =====================================================
@estudantes_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email")
    senha = data.get("senha")
    if not email or not senha:
        return jsonify({"erro": "Email e senha são obrigatórios."}), 400

    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT id, nome_completo, email, numero_matricula, escola, turma, senha, profile_id
            FROM estudantes
            WHERE email = %s
        """, (email,))
        estudante = cursor.fetchone()

        if not estudante:
            return jsonify({"erro": "Email ou senha inválidos."}), 401

        senha_hash = estudante.get("senha")
        if not check_password_hash(senha_hash, senha):
            return jsonify({"erro": "Email ou senha inválidos."}), 401

        # Não retorne a senha
        estudante.pop("senha", None)
        return jsonify(estudante), 200

    except mysql.connector.Error as erro:
        print("Erro no banco:", erro)
        return jsonify({"erro": "Erro no banco de dados.", "detalhe": str(erro)}), 500

    finally:
        cursor.close()
        conn.close()
