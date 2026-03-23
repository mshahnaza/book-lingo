import React, { useState, useEffect, useRef } from 'react';
import { API_URL, api } from '../services/api';
import { styles } from '../styles';

const BookReaderPage = ({ token, book, onClose }) => {
    const [displayMode, setDisplayMode] = useState('pages');
    const [currentPageNum, setCurrentPageNum] = useState(1);
    const [pageContent, setPageContent] = useState('');
    const [allPages, setAllPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTranslation, setShowTranslation] = useState(false);
    const [translationData, setTranslationData] = useState({
        word: '',
        translation: '',
        context: '',
        position: { x: 0, y: 0 }
    });
    const [translating, setTranslating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [jumpToPage, setJumpToPage] = useState('');
    const [showJumpInput, setShowJumpInput] = useState(false);
    const contentRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const pageRefs = useRef({});
    const currentPageRef = useRef(currentPageNum);

    useEffect(() => {
        currentPageRef.current = currentPageNum;
    }, [currentPageNum]);

    useEffect(() => {
        if (book) {
            if (displayMode === 'scroll') {
                loadAllPages();
            } else {
                loadPage(currentPageNum);
            }
        }
    }, [book, currentPageNum, displayMode]);

    useEffect(() => {
        if (displayMode !== 'scroll' || allPages.length === 0) return;

        const handleScroll = () => {
            const container = scrollContainerRef.current;
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            const containerTop = containerRect.top;

            let currentVisiblePage = 1;

            Object.entries(pageRefs.current).forEach(([pageNum, element]) => {
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // Check if the top of this page is above the middle of the container
                    if (rect.top <= containerTop + containerRect.height / 2) {
                        currentVisiblePage = parseInt(pageNum);
                    }
                }
            });

            if (currentVisiblePage !== currentPageRef.current) {
                setCurrentPageNum(currentVisiblePage);
            }
        };

        // Wait for next frame to ensure refs are populated
        const timeoutId = setTimeout(() => {
            const container = scrollContainerRef.current;
            if (container) {
                container.addEventListener('scroll', handleScroll);
                handleScroll(); // Call once to set initial page
            }
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            const container = scrollContainerRef.current;
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [displayMode, allPages]);

    const loadPage = async (pageNum) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/books/${book.id}/pages/${pageNum}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPageContent(data.textContent || '');
            } else {
                setPageContent('Failed to load page content');
            }
        } catch (error) {
            setPageContent('Error loading page: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadAllPages = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/books/${book.id}/pages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAllPages(data);
            } else {
                setAllPages([]);
            }
        } catch (error) {
            console.error('Error loading pages:', error);
            setAllPages([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to extract sentence containing the word
    const extractSentence = (text, word) => {
        if (!text || !word) return word;

        // Normalize: replace newlines and multiple spaces with single space
        const normalizedText = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
        const wordLower = word.toLowerCase();
        const textLower = normalizedText.toLowerCase();

        // Find word position
        const wordIndex = textLower.indexOf(wordLower);
        if (wordIndex === -1) return word;

        // Find sentence start - go back until we find . ! ? followed by space
        let sentenceStart = wordIndex;
        while (sentenceStart > 0) {
            // Check if previous char is sentence ender followed by space
            if (sentenceStart >= 2) {
                const prevChar = normalizedText[sentenceStart - 2];
                const spaceChar = normalizedText[sentenceStart - 1];
                if ((prevChar === '.' || prevChar === '!' || prevChar === '?') && spaceChar === ' ') {
                    break;
                }
            }
            sentenceStart--;
        }

        // Find sentence end - go forward until we find . ! ?
        let sentenceEnd = wordIndex + word.length;
        while (sentenceEnd < normalizedText.length) {
            const char = normalizedText[sentenceEnd];
            if (char === '.' || char === '!' || char === '?') {
                sentenceEnd++; // Include the punctuation
                break;
            }
            sentenceEnd++;
        }

        let sentence = normalizedText.substring(sentenceStart, sentenceEnd).trim();

        // If sentence is too long (>300 chars), truncate with context around word
        if (sentence.length > 300) {
            const wordPosInSentence = sentence.toLowerCase().indexOf(wordLower);
            const start = Math.max(0, wordPosInSentence - 100);
            const end = Math.min(sentence.length, wordPosInSentence + word.length + 100);
            sentence = (start > 0 ? '...' : '') +
                       sentence.substring(start, end).trim() +
                       (end < sentence.length ? '...' : '');
        }

        return sentence;
    };

    const handleTextSelection = async (e) => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText && selectedText.length > 0 && selectedText.length < 100) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Get the full page text from state
            let fullText = '';
            if (displayMode === 'scroll') {
                // In scroll mode, search all pages
                for (const page of allPages) {
                    if (page.textContent && page.textContent.toLowerCase().includes(selectedText.toLowerCase())) {
                        fullText = page.textContent;
                        break;
                    }
                }
            } else {
                fullText = pageContent;
            }

            console.log('=== DEBUG ===');
            console.log('displayMode:', displayMode);
            console.log('pageContent length:', pageContent?.length);
            console.log('fullText length:', fullText?.length);
            console.log('selectedText:', selectedText);

            // Extract sentence context
            const context = fullText ? extractSentence(fullText, selectedText) : selectedText;
            console.log('extracted context:', context);
            console.log('=== END DEBUG ===');

            setTranslationData({
                word: selectedText,
                translation: '',
                context: context,
                position: { x: rect.left, y: rect.bottom + 10 }
            });
            setShowTranslation(true);
            setTranslating(true);

            try {
                const response = await fetch(
                    `${API_URL}/words/translate?word=${encodeURIComponent(selectedText)}&sourceLanguage=${book.language}&targetLanguage=ru`,
                    {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );
                if (response.ok) {
                    const translation = await response.text();
                    setTranslationData(prev => ({ ...prev, translation }));
                } else {
                    setTranslationData(prev => ({ ...prev, translation: 'Translation failed' }));
                }
            } catch (error) {
                setTranslationData(prev => ({ ...prev, translation: 'Translation error' }));
            } finally {
                setTranslating(false);
            }
        }
    };

    const handleSaveWord = async () => {
        if (!translationData.word || !translationData.translation) return;

        setSaving(true);
        try {
            const response = await fetch(`${API_URL}/words`, {
                method: 'POST',
                headers: api.headers(token),
                body: JSON.stringify({
                    originalWord: translationData.word,
                    translatedWord: translationData.translation,
                    sourceLanguage: book.language,
                    targetLanguage: 'ru',
                    context: translationData.context,
                    bookId: book.id
                })
            });

            if (response.ok) {
                setShowTranslation(false);
                alert('Word saved to dictionary!');
            } else {
                const error = await response.json();
                alert('Failed to save word: ' + (error.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Error saving word: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePrevPage = () => {
        if (currentPageNum > 1) {
            setCurrentPageNum(currentPageNum - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPageNum < book.totalPages) {
            setCurrentPageNum(currentPageNum + 1);
        }
    };

    const handleJumpToPage = (e) => {
        e.preventDefault();
        const pageNum = parseInt(jumpToPage);
        if (pageNum >= 1 && pageNum <= book.totalPages) {
            if (displayMode === 'scroll' && pageRefs.current[pageNum]) {
                pageRefs.current[pageNum].scrollIntoView({ behavior: 'smooth' });
            }
            setCurrentPageNum(pageNum);
            setShowJumpInput(false);
            setJumpToPage('');
        }
    };

    const toggleDisplayMode = () => {
        setDisplayMode(displayMode === 'pages' ? 'scroll' : 'pages');
    };

    return (
        <div style={styles.readerContainer}>
            <div style={styles.readerHeader}>
                <button onClick={onClose} style={styles.readerBackButton}>
                    Back to Books
                </button>
                <div style={styles.readerBookInfo}>
                    <h2 style={styles.readerTitle}>{book.title}</h2>
                    <span style={styles.readerAuthor}>by {book.author}</span>
                </div>
                <div style={styles.headerControls}>
                    <button
                        onClick={toggleDisplayMode}
                        style={styles.displayModeButton}
                    >
                        {displayMode === 'pages' ? 'Scroll Mode' : 'Page Mode'}
                    </button>
                    <div style={styles.pageIndicator} onClick={() => setShowJumpInput(!showJumpInput)}>
                        {showJumpInput ? (
                            <form onSubmit={handleJumpToPage} style={styles.jumpForm}>
                                <input
                                    type="number"
                                    min="1"
                                    max={book.totalPages}
                                    value={jumpToPage}
                                    onChange={(e) => setJumpToPage(e.target.value)}
                                    style={styles.jumpInput}
                                    placeholder={currentPageNum.toString()}
                                    autoFocus
                                />
                                <span style={styles.pageTotal}>/ {book.totalPages}</span>
                            </form>
                        ) : (
                            <span>Page {currentPageNum} of {book.totalPages}</span>
                        )}
                    </div>
                </div>
            </div>

            <div style={styles.readerMain}>
                <div
                    ref={scrollContainerRef}
                    style={styles.readerContentClean}
                    onMouseUp={handleTextSelection}
                >
                    {loading ? (
                        <div style={styles.readerLoading}>Loading...</div>
                    ) : displayMode === 'scroll' ? (
                        <div style={styles.readerText}>
                            {allPages.map((page, idx) => (
                                <div
                                    key={page.id || idx}
                                    ref={el => pageRefs.current[page.pageNumber] = el}
                                    style={styles.scrollPageContainer}
                                >
                                    <div style={styles.readerPageLabel}>Page {page.pageNumber}</div>
                                    {page.textContent || ''}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div ref={contentRef} style={styles.readerText}>
                            {pageContent}
                        </div>
                    )}
                </div>

                {showTranslation && (
                    <div
                        style={{
                            ...styles.translationPopup,
                            left: Math.min(translationData.position.x, window.innerWidth - 320),
                            top: Math.min(translationData.position.y, window.innerHeight - 200)
                        }}
                    >
                        <div style={styles.translationHeader}>
                            <span style={styles.translationWord}>{translationData.word}</span>
                            <button
                                onClick={() => setShowTranslation(false)}
                                style={styles.translationClose}
                            >
                                x
                            </button>
                        </div>
                        <div style={styles.translationBody}>
                            {translating ? (
                                <span style={styles.translatingText}>Translating...</span>
                            ) : (
                                <span style={styles.translationResult}>{translationData.translation}</span>
                            )}
                        </div>
                        {translationData.context && (
                            <div style={styles.translationContext}>
                                "{translationData.context}"
                            </div>
                        )}
                        <div style={styles.translationActions}>
                            <button
                                onClick={handleSaveWord}
                                style={styles.saveWordButton}
                                disabled={saving || translating}
                            >
                                {saving ? 'Saving...' : 'Add to Dictionary'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {displayMode === 'pages' && (
                <div style={styles.readerFooter}>
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPageNum <= 1}
                        style={{
                            ...styles.navButton,
                            opacity: currentPageNum <= 1 ? 0.5 : 1
                        }}
                    >
                        Previous
                    </button>

                    <div style={styles.progressBar}>
                        <div
                            style={{
                                ...styles.progressFill,
                                width: `${(currentPageNum / book.totalPages) * 100}%`
                            }}
                        />
                    </div>

                    <button
                        onClick={handleNextPage}
                        disabled={currentPageNum >= book.totalPages}
                        style={{
                            ...styles.navButton,
                            opacity: currentPageNum >= book.totalPages ? 0.5 : 1
                        }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookReaderPage;
