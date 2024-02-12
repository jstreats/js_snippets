CREATE TABLE Projects (
    project_id SERIAL PRIMARY KEY,
    project_name TEXT NOT NULL,
    project_url TEXT NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);


CREATE TABLE Attributes (
    attribute_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    parent_attribute_ids INTEGER[] NULL,
    project_id INTEGER NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (parent_attribute_id) REFERENCES Attributes(attribute_id),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
);


CREATE TABLE Comments (
    comment_id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    parent_comment_id INTEGER NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (parent_comment_id) REFERENCES Comments(comment_id)
);

CREATE TABLE CommentsAttributes (
    comment_attribute_id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL,
    attribute_id INTEGER NOT NULL,
    value TEXT NOT NULL,
    FOREIGN KEY (comment_id) REFERENCES Comments(comment_id),
    FOREIGN KEY (attribute_id) REFERENCES Attributes(attribute_id)
);

Create table project_admins(
    project_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
);

