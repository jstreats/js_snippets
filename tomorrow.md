SELECT
    -- Selecting the metric details and calculated values
    tech_metric_values.metric_id,
    tech_metric_details.metric_name,
    tech_metric_details.lever,
    tech_metric_details.precision,
    tech_metric_details.is_percentage,
    tech_metric_details.orgs_eligible,
    tech_metric_details.rounding_logic,

    -- Calculating the actual value
    MAX(CASE WHEN value_type = 'actual' THEN value END) AS actual,

    -- Calculating the baseline value
    MAX(CASE WHEN value_type = 'baseline' THEN value END) AS baseline,

    -- Calculating the target value
    MAX(CASE WHEN value_type = 'target' THEN value END) AS target,

    -- Calculating the current year value (yearly value for the provided month_year)
    MAX(CASE WHEN value_type = 'yearly' AND tech_metric_values.month_year = to_date($1, 'YYYY-MM-DD') THEN value END) AS currentYear,

    -- Calculating the previous year value (yearly value for the previous year month_year)
    MAX(CASE WHEN value_type = 'yearly' AND tech_metric_values.month_year = to_date($3, 'YYYY-MM-DD') THEN value END) AS prevYear

FROM 
    tech_metric_values
JOIN 
    tech_metric_details ON tech_metric_details.metric_id = tech_metric_values.metric_id
WHERE
    -- Using provided month_year for current year and previous year
    tech_metric_values.month_year = CASE
                                        WHEN value_type = 'yearly' AND tech_metric_values.month_year = to_date($3, 'YYYY-MM-DD')
                                            THEN to_date($3, 'YYYY-MM-DD') -- Use prevYear month_year if the value is for the previous year
                                        ELSE to_date($1, 'YYYY-MM-DD') -- Use currentYear month_year for all other cases
                                    END
    AND tech_metric_values.org_id = $2 -- Filtering by organization ID
    AND tech_metric_values.soft_deleted = false -- Exclude soft deleted records

GROUP BY
    -- Grouping by metric details to aggregate the values
    tech_metric_values.metric_id,
    tech_metric_details.metric_name,
    tech_metric_details.lever,
    tech_metric_details.precision,
    tech_metric_details.is_percentage,
    tech_metric_details.orgs_eligible,
    tech_metric_details.rounding_logic;
