app.get('/comments', async (req, res) => {
    const { project_id, attributes, parent_comment_id, page = 1, limit = 10, sort = 'timestamp DESC' } = req.body;

    // The query is a bit complex so adding explanation:
    // The query uses a JSONB representation of the input attributes to filter comments that have a subset (<@) of attributes exactly matching the specified ones. This ensures that only comments with attributes that exactly match the provided list are considered.
    // It checks that the number of attributes associated with a comment exactly matches the number of attributes specified in the request. This is crucial for excluding comments with additional attributes not mentioned in the request.
    // The query aggregates the attributes of each comment into a JSONB array and compares it with the input attributes, ensuring an exact match in both the attributes' names and values.
    try {
        let baseQuery = `
            SELECT c.comment_id, c.content, c.project_id, c.timestamp, c.parent_comment_id
            FROM Comments c
            WHERE c.project_id = $1
            AND c.deleted = FALSE
            AND ($2::jsonb) <@ (
                SELECT jsonb_agg(jsonb_build_object('name', a.name, 'value', ca.value))
                FROM CommentsAttributes ca
                JOIN Attributes a ON a.attribute_id = ca.attribute_id
                WHERE ca.comment_id = c.comment_id
            )
            AND (
                SELECT COUNT(*)
                FROM CommentsAttributes ca
                WHERE ca.comment_id = c.comment_id
            ) = $3
        `;
        let queryParams = [
            project_id,
            JSON.stringify(attributes.map(attr => ({name: attr.name, value: attr.value}))),
            attributes.length
        ];

        if (parent_comment_id) {
            baseQuery += ` AND c.parent_comment_id = $4`;
            queryParams.push(parent_comment_id);
        }

        baseQuery += ` ORDER BY ${sort} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, (page - 1) * limit);

        const { rows } = await pool.query(baseQuery, queryParams);
        res.json(rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Internal Server Error');
    }
});
