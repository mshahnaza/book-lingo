package org.example.booklingo.services.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.example.booklingo.services.TranslationService;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class TranslationServiceImpl implements TranslationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        log.info("=== Translation Request ===");
        log.info("Text: '{}', Source: '{}', Target: '{}'", text, sourceLanguage, targetLanguage);

        // If source and target are the same, return original
        if (sourceLanguage.equalsIgnoreCase(targetLanguage)) {
            log.warn("Source and target languages are the same! Returning original text.");
            return text;
        }

        // Use free Google Translate (no API key required)
        String result = translateWithFreeGoogle(text, sourceLanguage, targetLanguage);
        if (result.contains("[Translation error]")) {
            // Fallback to MyMemory
            result = translateWithMyMemory(text, sourceLanguage, targetLanguage);
        }
        log.info("Final translation result: '{}'", result);
        return result;
    }

    @Override
    public String detectLanguage(String text) {
        return "auto";
    }

    // ==================== Free Google Translate (NO API KEY) ====================

    private String translateWithFreeGoogle(String text, String sourceLanguage, String targetLanguage) {
        try {
            log.info("Google Translate request: {} -> {} for text: {}", sourceLanguage, targetLanguage, text);

            // Build URL properly using UriComponentsBuilder to avoid double-encoding
            String url = UriComponentsBuilder
                .fromHttpUrl("https://translate.googleapis.com/translate_a/single")
                .queryParam("client", "gtx")
                .queryParam("sl", sourceLanguage.toLowerCase())
                .queryParam("tl", targetLanguage.toLowerCase())
                .queryParam("dt", "t")
                .queryParam("q", text)
                .encode()
                .toUriString();

            log.info("Request URL: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            String responseBody = response.getBody();
            log.info("Google Translate response: {}", responseBody);

            if (responseBody != null && responseBody.startsWith("[[")) {
                String translation = parseGoogleTranslateResponse(responseBody);
                if (translation != null && !translation.isEmpty()) {
                    log.info("Translation successful: {}", translation);
                    return translation;
                }
            }

            log.error("Unexpected response format from Google Translate");
            return text + " [Translation error]";

        } catch (Exception e) {
            log.error("Error calling Google Translate API: {}", e.getMessage());
            return text + " [Translation error]";
        }
    }

    private String parseGoogleTranslateResponse(String response) {
        try {
            // Parse JSON response using Jackson
            JsonNode root = objectMapper.readTree(response);

            // Response format: [[["translated","original",null,null,10],...],null,"en",...]
            // First element is array of translation segments
            if (root.isArray() && root.size() > 0) {
                JsonNode translationArray = root.get(0);

                if (translationArray != null && translationArray.isArray()) {
                    StringBuilder result = new StringBuilder();

                    for (JsonNode segment : translationArray) {
                        if (segment != null && segment.isArray() && segment.size() > 0) {
                            JsonNode translatedText = segment.get(0);
                            if (translatedText != null && translatedText.isTextual()) {
                                result.append(translatedText.asText());
                            }
                        }
                    }

                    String translation = result.toString();
                    // URL decode in case there are any encoded characters
                    try {
                        translation = URLDecoder.decode(translation, StandardCharsets.UTF_8.toString());
                    } catch (Exception e) {
                        // If decoding fails, use as-is
                    }

                    return translation;
                }
            }

            return null;
        } catch (Exception e) {
            log.error("Error parsing Google Translate response: {}", e.getMessage());
            return null;
        }
    }

    // ==================== MyMemory Translation (FREE FALLBACK) ====================

    private String translateWithMyMemory(String text, String sourceLanguage, String targetLanguage) {
        try {
            String langPair = sourceLanguage.toLowerCase() + "|" + targetLanguage.toLowerCase();

            log.info("MyMemory translation request: {} for text: {}", langPair, text);

            String url = UriComponentsBuilder
                    .fromHttpUrl("https://api.mymemory.translated.net/get")
                    .queryParam("q", text)
                    .queryParam("langpair", langPair)
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            log.info("MyMemory response: {}", response);

            if (response != null) {
                JsonNode root = objectMapper.readTree(response);
                JsonNode responseData = root.get("responseData");

                if (responseData != null) {
                    JsonNode translatedText = responseData.get("translatedText");
                    if (translatedText != null && translatedText.isTextual()) {
                        String translation = translatedText.asText();
                        if (!translation.contains("INVALID") && !translation.isEmpty()) {
                            return translation;
                        }
                    }
                }
            }

            log.error("MyMemory translation failed");
            return text + " [Translation unavailable]";

        } catch (Exception e) {
            log.error("Error calling MyMemory API: {}", e.getMessage());
            return text + " [Translation error]";
        }
    }
}
