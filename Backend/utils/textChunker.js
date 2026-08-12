/**
 * Split text into chunks for better AI processing
 * @param {string} text - Full text to chunk
 * @param {number} chunkSize - Target size per chunk in words
 * @param {number} overlap - Number of words to overlap between chunks
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number}>}
 */

export const chunkText = (
    text,
    chunkSize = 500,
    overlap = 50
) => {
    if (!text || typeof text !== "string" || !text.trim()) {
        return [];
    }

    // Prevent invalid values
    if (chunkSize <= 0) {
        chunkSize = 500;
    }

    if (overlap < 0) {
        overlap = 0;
    }

    if (overlap >= chunkSize) {
        overlap = Math.floor(chunkSize / 10);
    }

    // Clean text while preserving paragraph structure
    const cleanedText = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .trim();

    if (!cleanedText) {
        return [];
    }

    // Split into paragraphs
    const paragraphs = cleanedText
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0);

    const chunks = [];

    let currentChunk = [];
    let currentWordCount = 0;
    let chunkIndex = 0;

    const addChunk = (content) => {
        if (!content || !content.trim()) {
            return;
        }

        chunks.push({
            content: content.trim(),
            chunkIndex: chunkIndex++,
            pageNumber: 0,
        });
    };

    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.split(/\s+/);
        const paragraphWordCount = paragraphWords.length;

        // Handle paragraph larger than chunk size
        if (paragraphWordCount > chunkSize) {
            // Save current chunk first
            if (currentChunk.length > 0) {
                addChunk(currentChunk.join("\n\n"));
                currentChunk = [];
                currentWordCount = 0;
            }

            // Split large paragraph with overlap
            const step = chunkSize - overlap;

            for (
                let i = 0;
                i < paragraphWords.length;
                i += step
            ) {
                const chunkWords = paragraphWords.slice(
                    i,
                    i + chunkSize
                );

                if (chunkWords.length > 0) {
                    addChunk(chunkWords.join(" "));
                }

                // Stop when we reach the end
                if (i + chunkSize >= paragraphWords.length) {
                    break;
                }
            }

            continue;
        }

        // If adding this paragraph exceeds chunk size
        if (
            currentWordCount + paragraphWordCount > chunkSize &&
            currentChunk.length > 0
        ) {
            const previousText = currentChunk.join(" ");
            const previousWords = previousText.split(/\s+/);

            // Save current chunk
            addChunk(currentChunk.join("\n\n"));

            // Create overlap from previous chunk
            const overlapWords = previousWords.slice(
                -Math.min(overlap, previousWords.length)
            );

            const overlapText = overlapWords.join(" ");

            currentChunk = [];

            if (overlapText) {
                currentChunk.push(overlapText);
            }

            currentChunk.push(paragraph);

            currentWordCount =
                (overlapText
                    ? overlapText.split(/\s+/).length
                    : 0) + paragraphWordCount;
        } else {
            // Add paragraph to current chunk
            currentChunk.push(paragraph);
            currentWordCount += paragraphWordCount;
        }
    }

    // Add final chunk
    if (currentChunk.length > 0) {
        addChunk(currentChunk.join("\n\n"));
    }

    // Fallback
    if (chunks.length === 0 && cleanedText.length > 0) {
        const allWords = cleanedText.split(/\s+/);
        const step = chunkSize - overlap;

        for (
            let i = 0;
            i < allWords.length;
            i += step
        ) {
            const chunkWords = allWords.slice(
                i,
                i + chunkSize
            );

            if (chunkWords.length > 0) {
                addChunk(chunkWords.join(" "));
            }

            if (i + chunkSize >= allWords.length) {
                break;
            }
        }
    }

    return chunks;
};


/**
 * Find relevant chunks based on keyword matching
 *
 * @param {Array<Object>} chunks
 * @param {string|Object} query
 * @param {number} maxChunks
 * @returns {Array<Object>}
 */

export const findRelevantChunks = (
    chunks,
    query,
    maxChunks = 3
) => {
    if (
        !Array.isArray(chunks) ||
        chunks.length === 0 ||
        !query
    ) {
        return [];
    }

    // Convert query to string safely
    const normalizedQuery =
        typeof query === "string"
            ? query
            : query?.content ||
              query?.question ||
              String(query);

    if (
        typeof normalizedQuery !== "string" ||
        !normalizedQuery.trim()
    ) {
        return [];
    }

    // Stop words
    const stopWords = new Set([
        "the",
        "is",
        "at",
        "which",
        "on",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "with",
        "to",
        "for",
        "of",
        "as",
        "by",
        "this",
        "that",
        "it",
        "are",
        "was",
        "were",
        "be",
        "been",
        "has",
        "have",
        "had",
        "do",
        "does",
        "did",
        "can",
        "could",
        "would",
        "should",
        "from",
        "about",
        "into",
        "what",
        "when",
        "where",
        "who",
        "why",
        "how",
    ]);

    // Extract query words
    const queryWords = normalizedQuery
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(
            (word) =>
                word.length > 2 &&
                !stopWords.has(word)
        );

    // If query has no useful keywords
    if (queryWords.length === 0) {
        return chunks
            .slice(0, maxChunks)
            .map((chunk) => ({
                content: chunk.content,
                chunkIndex: chunk.chunkIndex,
                pageNumber: chunk.pageNumber,
                _id: chunk._id,
            }));
    }

    // Score every chunk
    const scoredChunks = chunks.map((chunk, index) => {
        const content = String(
            chunk?.content || ""
        ).toLowerCase();

        const contentWords =
            content.split(/\s+/).length;

        let score = 0;

        // Exact word matches
        for (const word of queryWords) {
            // Safely escape regex characters
            const escapedWord = word.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            const regex = new RegExp(
                `\\b${escapedWord}\\b`,
                "g"
            );

            const exactMatches =
                (content.match(regex) || []).length;

            score += exactMatches * 3;
        }

        // Partial matches
        const uniqueWordsFound = queryWords.filter(
            (word) => content.includes(word)
        ).length;

        if (uniqueWordsFound > 0) {
            score += uniqueWordsFound * 2;
        }

        // Bonus when multiple query words are found
        if (uniqueWordsFound >= 2) {
            score += 3;
        }

        // Normalize score according to chunk size
        const normalizedScore =
            score / Math.sqrt(contentWords || 1);

        // Slight position bonus
        const positionBonus =
            1 - (index / Math.max(chunks.length, 1)) * 0.1;

        return {
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: normalizedScore * positionBonus,
            rawScore: score,
            matchedWords: uniqueWordsFound,
        };
    });

    // Return only relevant chunks
    return scoredChunks
        .filter((chunk) => chunk.score > 0)
        .sort((a, b) => {
            // Higher score first
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            // More matched words first
            if (b.matchedWords !== a.matchedWords) {
                return (
                    b.matchedWords -
                    a.matchedWords
                );
            }

            // Earlier chunk first
            return a.chunkIndex - b.chunkIndex;
        })
        .slice(0, maxChunks);
};