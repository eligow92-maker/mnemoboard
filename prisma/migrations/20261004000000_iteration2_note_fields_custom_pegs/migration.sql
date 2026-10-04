-- Iteracja 2 (US-015–US-020): opowiadanie, emotki i kolor karteczki; własne wpisy GSP.

-- CreateEnum
CREATE TYPE "note_color" AS ENUM ('yellow', 'red', 'orange', 'green', 'blue');

-- AlterTable: istniejące karteczki dostają kolor żółty
ALTER TABLE "note"
    ADD COLUMN "story" VARCHAR(2000),
    ADD COLUMN "emoji" VARCHAR(64),
    ADD COLUMN "color" "note_color" NOT NULL DEFAULT 'yellow';

-- AlterTable: hasło GSP może być własnym wpisem (3–15 cyfr, bez słowa startowego)
ALTER TABLE "peg_word"
    ALTER COLUMN "number" TYPE VARCHAR(15),
    ALTER COLUMN "word" TYPE VARCHAR(80),
    ALTER COLUMN "default_word" DROP NOT NULL;

-- ===========================================================================
-- Dopisane ręcznie (ADR-002): ograniczenia z .prodready/define/data-model/schema.sql,
-- których nie da się wyrazić w schema.prisma. Nie usuwać przy regeneracji migracji.
-- ===========================================================================

ALTER TABLE "peg_word"
    DROP CONSTRAINT "peg_word_number_check",
    DROP CONSTRAINT "peg_word_default_word_check";

ALTER TABLE "peg_word"
    ADD CONSTRAINT "peg_word_number_check" CHECK ("number" ~ '^[0-9]{1,15}$'),
    ADD CONSTRAINT "peg_word_default_word_check"
        CHECK (("default_word" IS NULL) = (length("number") >= 3));
