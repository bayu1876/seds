-- AlterTable
ALTER TABLE "document"
  ALTER COLUMN "search_vector" TYPE tsvector
  USING "search_vector"::tsvector;

-- CreateFunction
CREATE OR REPLACE FUNCTION document_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."search_vector" :=
    setweight(to_tsvector('simple', coalesce(NEW."document_number", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."title", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."description", '')), 'B');

  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- CreateTrigger
CREATE TRIGGER document_search_vector_trigger
BEFORE INSERT OR UPDATE OF "document_number", "title", "description"
ON "document"
FOR EACH ROW
EXECUTE FUNCTION document_search_vector_update();

-- Backfill
UPDATE "document"
SET "search_vector" =
  setweight(to_tsvector('simple', coalesce("document_number", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("description", '')), 'B');

-- CreateIndex
CREATE INDEX "document_search_vector_idx"
ON "document"
USING GIN ("search_vector");
