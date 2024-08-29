To retrieve the values for different `value_type` (i.e., `actual`, `baseline`, `target`) together for all `org_id` and `metric_id` combinations, you can use a `GROUP BY` query with conditional aggregation. Here's an example query:

```sql
SELECT
    org_id,
    metric_id,
    MAX(CASE WHEN value_type = 'actual' THEN value END) AS actual_value,
    MAX(CASE WHEN value_type = 'baseline' THEN value END) AS baseline_value,
    MAX(CASE WHEN value_type = 'target' THEN value END) AS target_value
FROM
    your_table_name
GROUP BY
    org_id,
    metric_id
ORDER BY
    org_id,
    metric_id;
```

### Explanation:

- **MAX(CASE WHEN ... THEN ... END):** This part of the query is used to select the value for each specific `value_type`. The `MAX` function is applied to ensure that if there are multiple rows for the same `org_id`, `metric_id`, and `value_type`, only one value is chosen. If there's only one row for each combination, `MAX` effectively just returns that value.

- **GROUP BY org_id, metric_id:** This groups the results by `org_id` and `metric_id` so that each combination of these two columns will be represented by one row in the output.

- **ORDER BY org_id, metric_id:** This orders the results for easier readability, first by `org_id` and then by `metric_id`.

Replace `your_table_name` with the actual name of your table. This query will give you a result where each row contains the `org_id`, `metric_id`, and the corresponding values for `actual`, `baseline`, and `target`.