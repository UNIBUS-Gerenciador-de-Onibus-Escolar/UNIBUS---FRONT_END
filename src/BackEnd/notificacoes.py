from flask import Blueprint, request, jsonify
import mysql.connector
import traceback
import json

notificacoes_bp = Blueprint('notificacoes_bp', __name__)

# -----------------------
# Conexão com o banco
# -----------------------
def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="051526",
        database="UNIBUS"
    )

# -----------------------
# GET /rotas
# -----------------------
@notificacoes_bp.route('/rotas', methods=['GET'])
def listar_rotas():
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("SELECT id, nome_rota FROM rotas WHERE is_active = 1 ORDER BY nome_rota")
        rows = cursor.fetchall()
        data = [{'id': r[0], 'nome_rota': r[1]} for r in rows]
        return jsonify(data)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# -----------------------
# GET /motoristas
# -----------------------
@notificacoes_bp.route('/motoristas', methods=['GET'])
def listar_motoristas():
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("SELECT id, nome_completo, rota FROM motoristas WHERE is_active = 1 ORDER BY nome_completo")
        rows = cursor.fetchall()
        data = [{'id': r[0], 'nome_completo': r[1], 'rota': r[2]} for r in rows]
        return jsonify(data)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# -----------------------
# GET /listar/<usuario_id>
# -----------------------
@notificacoes_bp.route('/listar/<usuario_id>', methods=['GET'])
def listar_notificacoes_usuario(usuario_id):
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT n.id AS id,
                   ne.id AS envio_id,
                   ne.titulo,
                   ne.mensagem,
                   ne.remetente_tipo,
                   ne.destinatario_tipo,
                   ne.prioridade,
                   COALESCE(n.tipo, 'aviso') AS tipo,
                   COALESCE(n.lida, FALSE) AS lida,
                   ne.created_at
            FROM notificacoes_envios ne
            LEFT JOIN notificacoes n
            ON ne.id = n.envio_id AND n.usuario_id = %s
            ORDER BY ne.created_at DESC
        """
        cursor.execute(query, (usuario_id,))
        rows = cursor.fetchall()
        for r in rows:
            if hasattr(r['created_at'], 'isoformat'):
                r['created_at'] = r['created_at'].isoformat()
        return jsonify(rows)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# -----------------------
# PUT /marcar_lida/<notificacao_id>
# -----------------------
@notificacoes_bp.route('/marcar_lida/<notificacao_id>', methods=['PUT'])
def marcar_lida(notificacao_id):
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("UPDATE notificacoes SET lida = TRUE WHERE id = %s", (notificacao_id,))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# -----------------------
# POST /enviar
# -----------------------
@notificacoes_bp.route('/enviar', methods=['POST'])
def enviar_notificacao():
    conn = None
    cursor = None
    try:
        payload = request.get_json()
        remetente_tipo = payload.get('remetente_tipo', 'Gestão')
        remetente_id = payload.get('remetente_id')
        destinatario_tipo = payload.get('destinatario_tipo')
        routes = payload.get('routes') or []
        drivers = payload.get('drivers') or []
        titulo = payload.get('titulo')
        mensagem = payload.get('mensagem')
        prioridade = payload.get('prioridade', 'Baixa')
        tipo = payload.get('tipo', 'aviso')

        if not destinatario_tipo or not titulo or not mensagem:
            return jsonify({"error": "destinatario, titulo e mensagem são obrigatórios"}), 400

        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        # Insere o envio (auto-increment ID)
        cursor.execute("""
            INSERT INTO notificacoes_envios
            (remetente_tipo, remetente_id, destinatario_tipo, titulo, mensagem, routes_json, drivers_json, prioridade)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            remetente_tipo,
            remetente_id,
            destinatario_tipo,
            titulo,
            mensagem,
            json.dumps(routes) if routes else None,
            json.dumps(drivers) if drivers else None,
            prioridade
        ))
        conn.commit()

        cursor.execute("SELECT LAST_INSERT_ID() AS envio_id")
        envio_id = cursor.fetchone()['envio_id']

        recipient_user_ids = set()

        def add_recipient_rows(rows):
            for r in rows:
                if isinstance(r, dict):
                    recipient_user_ids.add(r['id'])
                else:
                    recipient_user_ids.add(r[0])

        # -----------------------
        # Determina destinatários
        # -----------------------
        if destinatario_tipo == "Todos":
            cursor.execute("SELECT id FROM profiles WHERE role IN ('estudante','motorista') AND is_active=1")
            add_recipient_rows(cursor.fetchall())
        elif destinatario_tipo == "Estudantes":
            if routes:
                placeholders = ','.join(['%s'] * len(routes))
                query = f"""
                    SELECT DISTINCT e.profile_id AS id
                    FROM inscricoes_rotas ir
                    JOIN estudantes e ON e.id = ir.estudante_id
                    WHERE ir.rota_id IN ({placeholders}) AND e.is_active=1
                """
                cursor.execute(query, routes)
                add_recipient_rows(cursor.fetchall())
            else:
                cursor.execute("SELECT profile_id AS id FROM estudantes WHERE is_active=1")
                add_recipient_rows(cursor.fetchall())
        elif destinatario_tipo == "Motoristas":
            if drivers:
                placeholders = ','.join(['%s'] * len(drivers))
                query = f"""
                    SELECT p.id
                    FROM motoristas m
                    JOIN profiles p ON p.email = m.email AND p.role='motorista' AND p.is_active=1
                    WHERE m.id IN ({placeholders})
                """
                cursor.execute(query, drivers)
                add_recipient_rows(cursor.fetchall())
            elif routes:
                placeholders = ','.join(['%s'] * len(routes))
                cursor.execute(f"SELECT nome_rota FROM rotas WHERE id IN ({placeholders})", routes)
                route_rows = cursor.fetchall()
                route_names = [r[0] for r in route_rows] if route_rows else []
                if route_names:
                    ph = ','.join(['%s'] * len(route_names))
                    query = f"""
                        SELECT p.id
                        FROM motoristas m
                        JOIN profiles p ON p.email = m.email AND p.role='motorista' AND p.is_active=1
                        WHERE m.rota IN ({ph})
                    """
                    cursor.execute(query, route_names)
                    add_recipient_rows(cursor.fetchall())
                else:
                    cursor.execute("SELECT id FROM profiles WHERE role='motorista' AND is_active=1")
                    add_recipient_rows(cursor.fetchall())

        # -----------------------
        # Insere notificações individuais
        # -----------------------
        if not recipient_user_ids:
            return jsonify({"error": "Nenhum destinatário encontrado."}), 400

        for uid in recipient_user_ids:
            if uid is None:
                continue  # ignora valores nulos
            cursor.execute("""
                INSERT INTO notificacoes (envio_id, usuario_id, titulo, mensagem, tipo)
                VALUES (%s,%s,%s,%s,%s)
            """, (envio_id, uid, titulo, mensagem, tipo))

        conn.commit()

        return jsonify({
            "success": True,
            "message": f"Mensagem enviada com sucesso para {len(recipient_user_ids)} destinatários.",
            "destinatario_tipo": destinatario_tipo,
            "totalRecipients": len(recipient_user_ids)
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# -----------------------
# GET /historico
# -----------------------
@notificacoes_bp.route('/historico', methods=['GET'])
def historico_notificacoes():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT n.id, n.envio_id, n.usuario_id, n.titulo, n.mensagem, n.tipo, n.lida, n.created_at
            FROM notificacoes n
            ORDER BY n.created_at DESC
        """)
        rows = cursor.fetchall()
        for r in rows:
            if hasattr(r['created_at'], 'isoformat'):
                r['created_at'] = r['created_at'].isoformat()
        return jsonify(rows)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
