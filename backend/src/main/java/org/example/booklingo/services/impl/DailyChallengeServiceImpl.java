package org.example.booklingo.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.booklingo.dto.request.DailyChallengeAnswerRequest;
import org.example.booklingo.dto.response.DailyChallengeResponse;
import org.example.booklingo.dto.response.DailyChallengeWordResponse;
import org.example.booklingo.entities.DailyChallenge;
import org.example.booklingo.entities.User;
import org.example.booklingo.entities.Word;
import org.example.booklingo.repositories.DailyChallengeRepository;
import org.example.booklingo.repositories.WordRepository;
import org.example.booklingo.services.DailyChallengeService;
import org.example.booklingo.services.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DailyChallengeServiceImpl implements DailyChallengeService {

    private final DailyChallengeRepository dailyChallengeRepository;
    private final WordRepository wordRepository;
    private final UserService userService;

    private static final int WORDS_PER_CHALLENGE = 5;
    private static final String[] EXERCISE_TYPES = {"translation", "fill_blank", "reverse", "context_match"};

    @Override
    @Transactional
    public DailyChallengeResponse getTodayChallenge() {
        User user = userService.getCurrentUser();
        LocalDate today = LocalDate.now();

        Optional<DailyChallenge> existingChallenge = dailyChallengeRepository
                .findByUserIdAndChallengeDate(user.getId(), today);

        DailyChallenge challenge;
        List<DailyChallengeWordResponse> words;

        if (existingChallenge.isPresent()) {
            challenge = existingChallenge.get();
            words = generateWordsForChallenge(user);
        } else {
            challenge = DailyChallenge.builder()
                    .user(user)
                    .challengeDate(today)
                    .wordsShown(WORDS_PER_CHALLENGE)
                    .build();
            challenge = dailyChallengeRepository.save(challenge);
            words = generateWordsForChallenge(user);
        }

        return buildResponse(challenge, user, words);
    }

    @Override
    @Transactional
    public DailyChallengeResponse submitAnswers(DailyChallengeAnswerRequest request) {
        User user = userService.getCurrentUser();
        LocalDate today = LocalDate.now();

        DailyChallenge challenge = dailyChallengeRepository
                .findByUserIdAndChallengeDate(user.getId(), today)
                .orElseThrow(() -> new RuntimeException("No challenge found for today"));

        if (challenge.getIsCompleted()) {
            return buildResponse(challenge, user, null);
        }

        // Regenerate the same exercises to get correct answers
        List<DailyChallengeWordResponse> exercises = generateWordsForChallenge(user);
        Map<Long, String> correctAnswers = exercises.stream()
                .collect(Collectors.toMap(DailyChallengeWordResponse::getWordId, DailyChallengeWordResponse::getCorrectAnswer));

        int correctCount = 0;
        for (DailyChallengeAnswerRequest.WordAnswer answer : request.getAnswers()) {
            String correctAnswer = correctAnswers.get(answer.getWordId());
            if (correctAnswer != null && correctAnswer.equalsIgnoreCase(answer.getSelectedAnswer())) {
                correctCount++;
            }
        }

        challenge.setWordsCorrect(correctCount);
        challenge.setIsCompleted(true);
        challenge.setCompletedAt(LocalDateTime.now());
        dailyChallengeRepository.save(challenge);

        return buildResponse(challenge, user, null);
    }

    @Override
    public DailyChallengeResponse getUserStats() {
        User user = userService.getCurrentUser();
        return buildResponse(null, user, null);
    }

    private List<DailyChallengeWordResponse> generateWordsForChallenge(User user) {
        log.info("Generating words for user ID: {}, username: {}", user.getId(), user.getUsername());
        List<Word> userWords = wordRepository.findByUserId(user.getId());
        log.info("Found {} words for user", userWords.size());

        if (userWords.isEmpty()) {
            log.warn("No words found for user {}", user.getUsername());
            return Collections.emptyList();
        }

        // Use deterministic seed based on user ID and today's date
        long seed = user.getId() * 31 + LocalDate.now().toEpochDay();
        Random seededRandom = new Random(seed);

        List<Word> sortedWords = userWords.stream()
                .sorted(Comparator.comparing(Word::getId))
                .collect(Collectors.toList());
        Collections.shuffle(sortedWords, seededRandom);

        List<Word> selectedWords = sortedWords.stream()
                .limit(WORDS_PER_CHALLENGE)
                .toList();

        List<String> allTranslations = userWords.stream()
                .map(Word::getTranslatedWord)
                .distinct()
                .collect(Collectors.toList());

        List<String> allOriginalWords = userWords.stream()
                .map(Word::getOriginalWord)
                .distinct()
                .collect(Collectors.toList());

        List<String> allContexts = userWords.stream()
                .map(Word::getContext)
                .filter(c -> c != null && !c.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        List<DailyChallengeWordResponse> exercises = new ArrayList<>();

        for (int i = 0; i < selectedWords.size(); i++) {
            Word word = selectedWords.get(i);
            String exerciseType = EXERCISE_TYPES[i % EXERCISE_TYPES.length];

            // If word has no context, fall back to translation
            if ((exerciseType.equals("fill_blank") || exerciseType.equals("context_match"))
                    && (word.getContext() == null || word.getContext().isEmpty())) {
                exerciseType = "translation";
            }

            exercises.add(buildWordResponse(word, exerciseType, allTranslations, allOriginalWords, allContexts));
        }

        return exercises;
    }

    private DailyChallengeWordResponse buildWordResponse(Word word, String exerciseType,
            List<String> allTranslations, List<String> allOriginalWords, List<String> allContexts) {

        List<String> options = new ArrayList<>();
        String question;
        String correctAnswer;
        String contextWithBlank = null;

        switch (exerciseType) {
            case "fill_blank":
                contextWithBlank = createContextWithBlank(word.getContext(), word.getOriginalWord());
                question = "Fill in the blank:";
                correctAnswer = word.getOriginalWord();
                options.add(word.getOriginalWord());
                addWrongOptions(options, allOriginalWords, word.getOriginalWord(), 3);
                break;

            case "reverse":
                question = "What is the original word for: \"" + word.getTranslatedWord() + "\"?";
                correctAnswer = word.getOriginalWord();
                options.add(word.getOriginalWord());
                addWrongOptions(options, allOriginalWords, word.getOriginalWord(), 3);
                break;

            case "context_match":
                question = "Which sentence contains the word \"" + word.getOriginalWord() + "\"?";
                correctAnswer = word.getContext();
                options.add(word.getContext());
                addWrongOptions(options, allContexts, word.getContext(), 3);
                break;

            case "translation":
            default:
                question = "What is the translation of \"" + word.getOriginalWord() + "\"?";
                correctAnswer = word.getTranslatedWord();
                options.add(word.getTranslatedWord());
                addWrongOptions(options, allTranslations, word.getTranslatedWord(), 3);
                break;
        }

        while (options.size() < 4) {
            options.add("---");
        }

        Collections.shuffle(options);

        return DailyChallengeWordResponse.builder()
                .wordId(word.getId())
                .originalWord(word.getOriginalWord())
                .correctTranslation(word.getTranslatedWord())
                .context(word.getContext())
                .options(options)
                .exerciseType(exerciseType)
                .question(question)
                .correctAnswer(correctAnswer)
                .contextWithBlank(contextWithBlank)
                .build();
    }

    private String createContextWithBlank(String context, String word) {
        if (context == null || word == null) return "___";
        return context.replaceAll("(?i)" + java.util.regex.Pattern.quote(word), "___");
    }

    private void addWrongOptions(List<String> options, List<String> allOptions, String correctAnswer, int count) {
        List<String> wrongOptions = allOptions.stream()
                .filter(o -> o != null && !o.equalsIgnoreCase(correctAnswer))
                .collect(Collectors.toList());
        Collections.shuffle(wrongOptions);
        options.addAll(wrongOptions.stream().limit(count).toList());
    }

    private DailyChallengeResponse buildResponse(DailyChallenge challenge, User user, List<DailyChallengeWordResponse> words) {
        // Count completed challenges and total correct words
        List<DailyChallenge> allChallenges = dailyChallengeRepository.findByUserId(user.getId());
        int completedCount = (int) allChallenges.stream().filter(DailyChallenge::getIsCompleted).count();
        int totalCorrect = allChallenges.stream()
                .filter(DailyChallenge::getIsCompleted)
                .mapToInt(c -> c.getWordsCorrect() != null ? c.getWordsCorrect() : 0)
                .sum();

        DailyChallengeResponse.DailyChallengeResponseBuilder builder = DailyChallengeResponse.builder()
                .totalChallengesCompleted(completedCount)
                .totalWordsLearned(totalCorrect);

        if (challenge != null) {
            builder.id(challenge.getId())
                    .challengeDate(challenge.getChallengeDate())
                    .isCompleted(challenge.getIsCompleted())
                    .wordsShown(challenge.getWordsShown())
                    .wordsCorrect(challenge.getWordsCorrect())
                    .words(words);
        }

        return builder.build();
    }
}