import { NostrFilter } from '../nodes/shared/types';

export class FilterBuilder {
    private filter: NostrFilter = {};

    withIds(ids: string[]): FilterBuilder {
        this.filter.ids = ids;
        return this;
    }

    withAuthors(authors: string[]): FilterBuilder {
        this.filter.authors = authors;
        return this;
    }

    withKinds(kinds: number[]): FilterBuilder {
        this.filter.kinds = kinds;
        return this;
    }

    withSince(timestamp: number): FilterBuilder {
        this.filter.since = timestamp;
        return this;
    }

    withUntil(timestamp: number): FilterBuilder {
        this.filter.until = timestamp;
        return this;
    }

    withLimit(limit: number): FilterBuilder {
        this.filter.limit = limit;
        return this;
    }

    withSearch(search: string): FilterBuilder {
        this.filter.search = search;
        return this;
    }

    build(): NostrFilter {
        return { ...this.filter };
    }

    static createTextNoteFilter(limit: number = 10): NostrFilter {
        return new FilterBuilder()
            .withKinds([1])
            .withLimit(limit)
            .build();
    }

    static createUserMetadataFilter(pubkeys: string[]): NostrFilter {
        return new FilterBuilder()
            .withKinds([0])
            .withAuthors(pubkeys)
            .build();
    }
}
