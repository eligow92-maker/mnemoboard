-- Mnemoboard — schemat danych MVP (dialekt PostgreSQL).
-- ORM i baza zostaną wybrane w fazie Design; ten plik jest źródłem prawdy dla encji z entities.md.

CREATE TYPE connection_kind AS ENUM ('association', 'chain');

CREATE TABLE board (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL CHECK (length(trim(name)) > 0),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE zone (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id   UUID             NOT NULL REFERENCES board (id) ON DELETE CASCADE,
    name       VARCHAR(60)      NOT NULL CHECK (length(trim(name)) > 0),
    x          DOUBLE PRECISION NOT NULL,
    y          DOUBLE PRECISION NOT NULL,
    width      DOUBLE PRECISION NOT NULL CHECK (width > 0),
    height     DOUBLE PRECISION NOT NULL CHECK (height > 0),
    created_at TIMESTAMPTZ      NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE INDEX zone_board_id_idx ON zone (board_id);

CREATE TABLE note (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id    UUID             NOT NULL REFERENCES board (id) ON DELETE CASCADE,
    zone_id     UUID             REFERENCES zone (id) ON DELETE SET NULL,
    topic       VARCHAR(500)     NOT NULL CHECK (length(trim(topic)) > 0),
    image_words VARCHAR(500),
    x           DOUBLE PRECISION NOT NULL,
    y           DOUBLE PRECISION NOT NULL,
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE INDEX note_board_id_idx ON note (board_id);
CREATE INDEX note_zone_id_idx ON note (zone_id);

CREATE TABLE connection (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id       UUID            NOT NULL REFERENCES board (id) ON DELETE CASCADE,
    source_note_id UUID            NOT NULL REFERENCES note (id) ON DELETE CASCADE,
    target_note_id UUID            NOT NULL REFERENCES note (id) ON DELETE CASCADE,
    kind           connection_kind NOT NULL DEFAULT 'association',
    created_at     TIMESTAMPTZ     NOT NULL DEFAULT now(),
    CHECK (source_note_id <> target_note_id)
);

CREATE INDEX connection_board_id_idx ON connection (board_id);
-- Jedno połączenie na parę karteczek, niezależnie od kierunku.
CREATE UNIQUE INDEX connection_pair_uniq
    ON connection (least(source_note_id, target_note_id), greatest(source_note_id, target_note_id));
-- Łańcuch: najwyżej jeden następnik i jeden poprzednik. Brak pętli waliduje aplikacja.
CREATE UNIQUE INDEX connection_chain_source_uniq ON connection (source_note_id) WHERE kind = 'chain';
CREATE UNIQUE INDEX connection_chain_target_uniq ON connection (target_note_id) WHERE kind = 'chain';

CREATE TABLE peg_word (
    number       VARCHAR(2)  PRIMARY KEY CHECK (number ~ '^[0-9]{1,2}$'),
    word         VARCHAR(40) NOT NULL CHECK (length(trim(word)) > 0),
    default_word VARCHAR(40) NOT NULL CHECK (length(trim(default_word)) > 0),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE review_session (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id    UUID        NOT NULL REFERENCES board (id) ON DELETE CASCADE,
    started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ
);

CREATE INDEX review_session_board_finished_idx ON review_session (board_id, finished_at);
CREATE INDEX review_session_finished_at_idx ON review_session (finished_at);

CREATE TABLE review_result (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID        NOT NULL REFERENCES review_session (id) ON DELETE CASCADE,
    note_id     UUID        NOT NULL REFERENCES note (id) ON DELETE CASCADE,
    remembered  BOOLEAN     NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (session_id, note_id)
);
