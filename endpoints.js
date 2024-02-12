app.post('/comments', async (req, res) => {
    const { content, project_id, parent_comment_id, attributes } = req.body;
    try {
      const client = await pool.connect();
  
      await client.query('BEGIN');
  
      const commentResult = await client.query(
        'INSERT INTO Comments (content, project_id, parent_comment_id) VALUES ($1, $2, $3) RETURNING *',
        [content, project_id, parent_comment_id || null]
      );
  
      const comment = commentResult.rows[0];
  
      for (const attr of attributes) {
        const attributeResult = await client.query(
          'SELECT attribute_id FROM Attributes WHERE name = $1 AND project_id = $2',
          [attr.attribute_name, project_id]
        );
        if (attributeResult.rows.length > 0) {
          const attribute_id = attributeResult.rows[0].attribute_id;
          await client.query(
            'INSERT INTO CommentsAttributes (comment_id, attribute_id, value) VALUES ($1, $2, $3)',
            [comment.comment_id, attribute_id, attr.value]
          );
        }
      }
  
      await client.query('COMMIT');
  
      res.status(201).json(comment);
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  });

  
  app.get('/comments', async (req, res) => {
    const { project_id, attribute_name, value, parent_comment_id, page = 1, limit = 10, sort = 'timestamp DESC' } = req.query;
    try {
      const client = await pool.connect();
      let query = `
        SELECT c.comment_id, c.content, c.project_id, c.timestamp, c.parent_comment_id
        FROM Comments c
        JOIN CommentsAttributes ca ON c.comment_id = ca.comment_id
        JOIN Attributes a ON ca.attribute_id = a.attribute_id
        WHERE c.project_id = $1
        AND c.deleted = FALSE
      `;
      const queryParams = [project_id];
      let currentIndex = queryParams.length;
  
      if (attribute_name) {
        query += ` AND a.name = $${++currentIndex}`;
        queryParams.push(attribute_name);
      }
  
      if (value) {
        query += ` AND ca.value = $${++currentIndex}`;
        queryParams.push(value);
      }
  
      if (parent_comment_id) {
        query += ` AND c.parent_comment_id = $${++currentIndex}`;
        queryParams.push(parent_comment_id);
      }
  
      query += ` ORDER BY ${sort} LIMIT $${++currentIndex} OFFSET $${++currentIndex}`;
      queryParams.push(limit, (page - 1) * limit);
  
      const { rows } = await client.query(query, queryParams);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  
  app.delete('/comments/:comment_id', async (req, res) => {
    const { comment_id } = req.params;
    try {
      const { rowCount } = await pool.query(
        'UPDATE Comments SET deleted = TRUE WHERE comment_id = $1',
        [comment_id]
      );
  
      if (rowCount > 0) {
        res.json({ message: 'Comment deleted successfully.' });
      } else {
        res.status(404).json({ message: 'Comment not found.' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  