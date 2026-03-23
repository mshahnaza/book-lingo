package org.example.booklingo.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.booklingo.entities.GrammarTopic;
import org.example.booklingo.repositories.GrammarTopicRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class GrammarDataInitializer implements CommandLineRunner {

    private final GrammarTopicRepository grammarTopicRepository;
    private static final String SOURCE = "British Council";
    private static final String BASE_URL = "https://learnenglish.britishcouncil.org/grammar";

    @Override
    public void run(String... args) {
        if (grammarTopicRepository.count() > 0) {
            log.info("Grammar topics already initialized, skipping...");
            return;
        }

        log.info("Initializing grammar topics from British Council...");

        List<GrammarTopic> topics = Arrays.asList(
            // ========== A1-A2 Level ==========
            createTopic("A1-A2", "Present simple: 'to be'",
                "Using 'am', 'is', 'are' to talk about situations and states",
                "/a1-a2-grammar/present-simple-be", 1),
            createTopic("A1-A2", "Present simple",
                "Talking about habits, routines and general truths",
                "/a1-a2-grammar/present-simple", 2),
            createTopic("A1-A2", "Present simple: 'have got'",
                "Using 'have got' to talk about possession",
                "/a1-a2-grammar/present-simple-have-got", 3),
            createTopic("A1-A2", "Present continuous",
                "Talking about actions happening now",
                "/a1-a2-grammar/present-continuous", 4),
            createTopic("A1-A2", "Articles: 'a', 'an', 'the'",
                "When to use a, an, or the",
                "/a1-a2-grammar/articles-a-an-the", 5),
            createTopic("A1-A2", "Articles: 'the' or no article",
                "When to use 'the' and when to use no article",
                "/a1-a2-grammar/articles-the-or-no-article", 6),
            createTopic("A1-A2", "Question forms",
                "Making questions with inversion",
                "/a1-a2-grammar/question-forms", 7),
            createTopic("A1-A2", "Past simple",
                "Talking about completed actions in the past",
                "/a1-a2-grammar/past-simple", 8),
            createTopic("A1-A2", "Past continuous and past simple",
                "Using past continuous with past simple",
                "/a1-a2-grammar/past-continuous-past-simple", 9),
            createTopic("A1-A2", "Adjectives and prepositions",
                "Common adjective + preposition combinations",
                "/a1-a2-grammar/adjectives-prepositions", 10),
            createTopic("A1-A2", "Adjectives ending in '-ed' and '-ing'",
                "Difference between bored/boring, interested/interesting",
                "/a1-a2-grammar/adjectives-ending-ed-ing", 11),
            createTopic("A1-A2", "Possessives and 's",
                "Showing possession with apostrophe s",
                "/a1-a2-grammar/possessives-s", 12),
            createTopic("A1-A2", "Comparative and superlative adjectives",
                "Comparing things: bigger, the biggest",
                "/a1-a2-grammar/comparative-superlative-adjectives", 13),
            createTopic("A1-A2", "Countable and uncountable nouns",
                "Understanding which nouns can be counted",
                "/a1-a2-grammar/countable-uncountable-nouns", 14),
            createTopic("A1-A2", "Infinitive of purpose",
                "Using 'to' + verb to explain why",
                "/a1-a2-grammar/infinitive-purpose", 15),
            createTopic("A1-A2", "Prepositions of place",
                "In, on, at, under, behind, etc.",
                "/a1-a2-grammar/prepositions-place", 16),
            createTopic("A1-A2", "Prepositions of time",
                "In, on, at with time expressions",
                "/a1-a2-grammar/prepositions-time", 17),
            createTopic("A1-A2", "Modals: 'can' and 'could'",
                "Talking about ability and possibility",
                "/a1-a2-grammar/modals-can-could", 18),
            createTopic("A1-A2", "Modals: 'have to', 'must', 'should'",
                "Talking about obligation and advice",
                "/a1-a2-grammar/modals-have-to-must-should", 19),
            createTopic("A1-A2", "'Some' and 'any'",
                "Using some and any with countable and uncountable nouns",
                "/a1-a2-grammar/some-any", 20),

            // ========== B1-B2 Level ==========
            createTopic("B1-B2", "Present perfect",
                "Connecting past actions to the present",
                "/b1-b2-grammar/present-perfect", 1),
            createTopic("B1-B2", "Present perfect simple and continuous",
                "Difference between 'I have done' and 'I have been doing'",
                "/b1-b2-grammar/present-perfect-simple-continuous", 2),
            createTopic("B1-B2", "Present perfect: 'just', 'yet', 'still', 'already'",
                "Using time adverbs with present perfect",
                "/b1-b2-grammar/present-perfect-just-yet-still-already", 3),
            createTopic("B1-B2", "Past perfect",
                "Talking about the past before another past event",
                "/b1-b2-grammar/past-perfect", 4),
            createTopic("B1-B2", "Future forms: 'will', 'be going to', present continuous",
                "Different ways to talk about the future",
                "/b1-b2-grammar/future-forms-will-be-going-present-continuous", 5),
            createTopic("B1-B2", "Conditionals: zero, first and second",
                "If clauses for real and hypothetical situations",
                "/b1-b2-grammar/conditionals-zero-first-second", 6),
            createTopic("B1-B2", "Conditionals: third and mixed",
                "Hypothetical situations in the past",
                "/b1-b2-grammar/conditionals-third-mixed", 7),
            createTopic("B1-B2", "Passives",
                "Changing focus with passive voice",
                "/b1-b2-grammar/passives", 8),
            createTopic("B1-B2", "Reported speech",
                "Reporting what someone said",
                "/b1-b2-grammar/reported-speech", 9),
            createTopic("B1-B2", "Relative clauses",
                "Using who, which, that, where, when",
                "/b1-b2-grammar/relative-clauses", 10),
            createTopic("B1-B2", "Different uses of 'used to'",
                "'Used to', 'be used to', 'get used to'",
                "/b1-b2-grammar/different-uses-of-used-to", 11),
            createTopic("B1-B2", "Wishes: 'wish' and 'if only'",
                "Expressing wishes about present and past",
                "/b1-b2-grammar/wishes-wish-if-only", 12),
            createTopic("B1-B2", "Phrasal verbs",
                "Verbs with particles that change meaning",
                "/b1-b2-grammar/phrasal-verbs", 13),
            createTopic("B1-B2", "Verb patterns",
                "Gerunds and infinitives after verbs",
                "/b1-b2-grammar/verb-patterns", 14),
            createTopic("B1-B2", "Modals of deduction",
                "Must, might, can't for logical conclusions",
                "/b1-b2-grammar/modals-deduction", 15),
            createTopic("B1-B2", "British English and American English",
                "Key differences between UK and US English",
                "/b1-b2-grammar/british-english-american-english", 16),

            // ========== C1 Level ==========
            createTopic("C1", "Advanced present simple and continuous",
                "Advanced uses of present tenses",
                "/c1-grammar/advanced-present-simple-continuous", 1),
            createTopic("C1", "Advanced passives review",
                "Complex passive structures",
                "/c1-grammar/advanced-passives-review", 2),
            createTopic("C1", "Participle clauses",
                "Using present, past and perfect participles",
                "/c1-grammar/participle-clauses", 3),
            createTopic("C1", "Inversion and conditionals",
                "Formal conditionals without 'if'",
                "/c1-grammar/inversion-conditionals", 4),
            createTopic("C1", "Patterns with reporting verbs",
                "Different structures after reporting verbs",
                "/c1-grammar/patterns-reporting-verbs", 5),
            createTopic("C1", "Contrasting ideas",
                "Although, despite, whereas, while",
                "/c1-grammar/contrasting-ideas", 6),
            createTopic("C1", "Avoiding repetition in a text",
                "Using substitution and ellipsis",
                "/c1-grammar/avoiding-repetition-text", 7),
            createTopic("C1", "Word order in phrasal verbs",
                "Separable and inseparable phrasal verbs",
                "/c1-grammar/word-order-phrasal-verbs", 8),
            createTopic("C1", "Emphasis: cleft sentences, inversion and auxiliaries",
                "Adding emphasis to sentences",
                "/c1-grammar/emphasis-cleft-sentences-inversion-auxiliaries", 9),
            createTopic("C1", "Discourse markers",
                "Connecting ideas in speech and writing",
                "/c1-grammar/discourse-markers", 10)
        );

        grammarTopicRepository.saveAll(topics);
        log.info("Successfully initialized {} grammar topics", topics.size());
    }

    private GrammarTopic createTopic(String level, String name, String description, String urlPath, int order) {
        return GrammarTopic.builder()
                .level(level)
                .name(name)
                .description(description)
                .url(BASE_URL + urlPath)
                .displayOrder(order)
                .source(SOURCE)
                .build();
    }
}