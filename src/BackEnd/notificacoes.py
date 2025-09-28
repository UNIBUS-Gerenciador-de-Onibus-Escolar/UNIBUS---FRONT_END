from flask import Blueprint, request, jsonify
import mysql.connector
import traceback
import json

notificacoes_bp = Blueprint('notificacoes_bp', __name__)

def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="neto2007",
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
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

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
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

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
        cursor.close()
        conn.close()
        for r in rows:
            if hasattr(r['created_at'], 'isoformat'):
                r['created_at'] = r['created_at'].isoformat()
        return jsonify(rows)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

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
        cursor.close()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -----------------------
# POST /enviar
# -----------------------
@notificacoes_bp.route('/enviar', methods=['POST'])
def enviar_notificacao():
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
        for uid in recipient_user_ids:
            cursor.execute("""
                INSERT INTO notificacoes (envio_id, usuario_id, titulo, mensagem, tipo)
                VALUES (%s,%s,%s,%s,%s)
            """, (envio_id, uid, titulo, mensagem, tipo))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"Mensagem enviada com sucesso para {len(recipient_user_ids)} destinatários.",
            "destinatario_tipo": destinatario_tipo,
            "totalRecipients": len(recipient_user_ids)
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -----------------------
# GET /historico
# -----------------------
@notificacoes_bp.route('/historico', methods=['GET'])
def historico_envios():
    try:
        limit = int(request.args.get('limit', 50))
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, remetente_tipo, destinatario_tipo, titulo, mensagem, prioridade,
                   routes_json, drivers_json, created_at
            FROM notificacoes_envios
            ORDER BY created_at DESC
            LIMIT %s
        """, (limit,))
        envios = cursor.fetchall()

        result = []
        for e in envios:
            created_at = e['created_at'].isoformat() if hasattr(e['created_at'], 'isoformat') else str(e['created_at'])
            routes = json.loads(e['routes_json']) if e['routes_json'] else []
            drivers = json.loads(e['drivers_json']) if e['drivers_json'] else []
            destinatario_tipo = e['destinatario_tipo'] if e.get('destinatario_tipo') else "Todos"

            cursor.execute("SELECT COUNT(*) AS count FROM notificacoes WHERE envio_id = %s AND lida = TRUE", (e['id'],))
            read_count = cursor.fetchone()['count']

            cursor.execute("SELECT COUNT(*) AS total FROM notificacoes WHERE envio_id = %s", (e['id'],))
            total_recipients = cursor.fetchone()['total']

            result.append({
                "id": e["id"],
                "titulo": e["titulo"],
                "mensagem": e["mensagem"],
                "destinatario_tipo": destinatario_tipo,
                "routes": routes,
                "drivers": drivers,
                "prioridade": e["prioridade"],
                "created_at": created_at,
                "totalRecipients": total_recipients,
                "readCount": read_count,
            })

        cursor.close()
        conn.close()
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -----------------------
# DELETE /apagar/<envio_id>
# -----------------------
@notificacoes_bp.route('/apagar/<envio_id>', methods=['DELETE'])
def apagar_notificacao(envio_id):
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM notificacoes WHERE envio_id = %s", (envio_id,))
        cursor.execute("DELETE FROM notificacoes_envios WHERE id = %s", (envio_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Notificação excluída com sucesso."})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
