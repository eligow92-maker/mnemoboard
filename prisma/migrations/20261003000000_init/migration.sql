-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "connection_kind" AS ENUM ('association', 'chain');

-- CreateTable
CREATE TABLE "board" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "board_id" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "board_id" UUID NOT NULL,
    "zone_id" UUID,
    "topic" VARCHAR(500) NOT NULL,
    "image_words" VARCHAR(500),
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connection" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "board_id" UUID NOT NULL,
    "source_note_id" UUID NOT NULL,
    "target_note_id" UUID NOT NULL,
    "kind" "connection_kind" NOT NULL DEFAULT 'association',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peg_word" (
    "number" VARCHAR(2) NOT NULL,
    "word" VARCHAR(40) NOT NULL,
    "default_word" VARCHAR(40) NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "peg_word_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "review_session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "board_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ,

    CONSTRAINT "review_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_result" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "note_id" UUID NOT NULL,
    "remembered" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "zone_board_id_idx" ON "zone"("board_id");

-- CreateIndex
CREATE INDEX "note_board_id_idx" ON "note"("board_id");

-- CreateIndex
CREATE INDEX "note_zone_id_idx" ON "note"("zone_id");

-- CreateIndex
CREATE INDEX "connection_board_id_idx" ON "connection"("board_id");

-- CreateIndex
CREATE INDEX "review_session_board_finished_idx" ON "review_session"("board_id", "finished_at");

-- CreateIndex
CREATE INDEX "review_session_finished_at_idx" ON "review_session"("finished_at");

-- CreateIndex
CREATE UNIQUE INDEX "review_result_session_id_note_id_key" ON "review_result"("session_id", "note_id");

-- AddForeignKey
ALTER TABLE "zone" ADD CONSTRAINT "zone_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zone"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_source_note_id_fkey" FOREIGN KEY ("source_note_id") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_target_note_id_fkey" FOREIGN KEY ("target_note_id") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review_session" ADD CONSTRAINT "review_session_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review_result" ADD CONSTRAINT "review_result_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "review_session"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review_result" ADD CONSTRAINT "review_result_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION;


-- ===========================================================================
-- Dopisane ręcznie (ADR-002): elementy z .prodready/define/data-model/schema.sql,
-- których nie da się wyrazić w schema.prisma. Nie usuwać przy regeneracji migracji.
-- Każdą regułę unikalności pilnuje test w tests/integration/db-schema.test.ts.
-- ===========================================================================

-- Jedno połączenie na parę karteczek, niezależnie od kierunku.
CREATE UNIQUE INDEX "connection_pair_uniq"
    ON "connection" (least("source_note_id", "target_note_id"), greatest("source_note_id", "target_note_id"));

-- Łańcuch: najwyżej jeden następnik i jeden poprzednik. Brak pętli waliduje aplikacja.
CREATE UNIQUE INDEX "connection_chain_source_uniq" ON "connection" ("source_note_id") WHERE "kind" = 'chain';
CREATE UNIQUE INDEX "connection_chain_target_uniq" ON "connection" ("target_note_id") WHERE "kind" = 'chain';

-- Ograniczenia CHECK
ALTER TABLE "board" ADD CONSTRAINT "board_name_check" CHECK (length(trim("name")) > 0);

ALTER TABLE "zone" ADD CONSTRAINT "zone_name_check" CHECK (length(trim("name")) > 0);
ALTER TABLE "zone" ADD CONSTRAINT "zone_width_check" CHECK ("width" > 0);
ALTER TABLE "zone" ADD CONSTRAINT "zone_height_check" CHECK ("height" > 0);

ALTER TABLE "note" ADD CONSTRAINT "note_topic_check" CHECK (length(trim("topic")) > 0);

ALTER TABLE "connection" ADD CONSTRAINT "connection_check" CHECK ("source_note_id" <> "target_note_id");

ALTER TABLE "peg_word" ADD CONSTRAINT "peg_word_number_check" CHECK ("number" ~ '^[0-9]{1,2}$');
ALTER TABLE "peg_word" ADD CONSTRAINT "peg_word_word_check" CHECK (length(trim("word")) > 0);
ALTER TABLE "peg_word" ADD CONSTRAINT "peg_word_default_word_check" CHECK (length(trim("default_word")) > 0);
