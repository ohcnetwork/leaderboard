-- CreateTable
CREATE TABLE "Contributor" (
    "username" VARCHAR NOT NULL,
    "name" VARCHAR,
    "role" VARCHAR,
    "title" VARCHAR,
    "avatarUrl" VARCHAR,
    "bio" TEXT,
    "socialProfiles" JSONB,
    "joiningDate" DATE,
    "meta" JSONB,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "ActivityDefinition" (
    "slug" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "points" SMALLINT,
    "icon" VARCHAR,

    CONSTRAINT "ActivityDefinition_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Activity" (
    "slug" VARCHAR NOT NULL,
    "contributor" VARCHAR NOT NULL,
    "activityDefinition" VARCHAR NOT NULL,
    "title" VARCHAR,
    "occuredAt" TIMESTAMP(6) NOT NULL,
    "link" VARCHAR,
    "text" TEXT,
    "points" SMALLINT,
    "meta" JSONB,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "GlobalAggregate" (
    "slug" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "value" JSONB,

    CONSTRAINT "GlobalAggregate_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "ContributorAggregateDefinition" (
    "slug" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,

    CONSTRAINT "ContributorAggregateDefinition_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "ContributorAggregate" (
    "aggregate" VARCHAR NOT NULL,
    "contributor" VARCHAR NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "ContributorAggregate_pkey" PRIMARY KEY ("aggregate","contributor")
);

-- CreateTable
CREATE TABLE "BadgeDefinition" (
    "slug" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT NOT NULL,
    "variants" JSONB NOT NULL,

    CONSTRAINT "BadgeDefinition_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "ContributorBadge" (
    "slug" VARCHAR NOT NULL,
    "badge" VARCHAR NOT NULL,
    "contributor" VARCHAR NOT NULL,
    "variant" VARCHAR NOT NULL,
    "achievedOn" DATE NOT NULL,
    "meta" JSONB,

    CONSTRAINT "ContributorBadge_pkey" PRIMARY KEY ("slug")
);

-- CreateIndex
CREATE INDEX "Activity_occuredAt_idx" ON "Activity"("occuredAt");

-- CreateIndex
CREATE INDEX "Activity_contributor_idx" ON "Activity"("contributor");

-- CreateIndex
CREATE INDEX "Activity_activityDefinition_idx" ON "Activity"("activityDefinition");

-- CreateIndex
CREATE INDEX "ContributorAggregate_contributor_idx" ON "ContributorAggregate"("contributor");

-- CreateIndex
CREATE INDEX "ContributorAggregate_aggregate_idx" ON "ContributorAggregate"("aggregate");

-- CreateIndex
CREATE INDEX "ContributorBadge_contributor_idx" ON "ContributorBadge"("contributor");

-- CreateIndex
CREATE INDEX "ContributorBadge_badge_idx" ON "ContributorBadge"("badge");

-- CreateIndex
CREATE INDEX "ContributorBadge_achievedOn_idx" ON "ContributorBadge"("achievedOn");

-- CreateIndex
CREATE UNIQUE INDEX "ContributorBadge_badge_contributor_variant_key" ON "ContributorBadge"("badge", "contributor", "variant");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_contributor_fkey" FOREIGN KEY ("contributor") REFERENCES "Contributor"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_activityDefinition_fkey" FOREIGN KEY ("activityDefinition") REFERENCES "ActivityDefinition"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorAggregate" ADD CONSTRAINT "ContributorAggregate_aggregate_fkey" FOREIGN KEY ("aggregate") REFERENCES "ContributorAggregateDefinition"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorAggregate" ADD CONSTRAINT "ContributorAggregate_contributor_fkey" FOREIGN KEY ("contributor") REFERENCES "Contributor"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorBadge" ADD CONSTRAINT "ContributorBadge_badge_fkey" FOREIGN KEY ("badge") REFERENCES "BadgeDefinition"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorBadge" ADD CONSTRAINT "ContributorBadge_contributor_fkey" FOREIGN KEY ("contributor") REFERENCES "Contributor"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
