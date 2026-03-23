import React, { useState, useEffect } from 'react';
import { API_URL, api } from '../services/api';
import { styles } from '../styles';

const DictionaryPage = ({ token }) => {
    const [words, setWords] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterBookId, setFilterBookId] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [wordsRes, booksRes] = await Promise.all([
                fetch(`${API_URL}/words`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/books`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const wordsData = await wordsRes.json();
            const booksData = await booksRes.json();

            setWords(wordsData);
            setBooks(booksData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this word?')) {
            try {
                await fetch(`${API_URL}/words/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setWords(words.filter(w => w.id !== id));
            } catch (error) {
                alert('Delete failed: ' + error.message);
            }
        }
    };

    const handleCreateFlashcard = async (word) => {
        try {
            const response = await fetch(`${API_URL}/flashcards`, {
                method: 'POST',
                headers: api.headers(token),
                body: JSON.stringify({
                    front: word.originalWord,
                    back: word.translatedWord,
                    wordId: word.id
                })
            });

            if (response.ok) {
                alert('Flashcard created successfully!');
            } else {
                const error = await response.json();
                alert('Failed to create flashcard: ' + (error.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Error creating flashcard: ' + error.message);
        }
    };

    const getBookTitle = (bookId) => {
        const book = books.find(b => b.id === bookId);
        return book ? book.title : 'Unknown book';
    };

    const filteredWords = words.filter(word => {
        const matchesBook = filterBookId === 'all' || word.bookId === parseInt(filterBookId);
        const matchesSearch = !searchTerm ||
            word.originalWord.toLowerCase().includes(searchTerm.toLowerCase()) ||
            word.translatedWord.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesBook && matchesSearch;
    });

    return (
        <>
            <div style={styles.pageHeader}>
                <div style={styles.headerFlex}>
                    <div>
                        <h1 style={styles.pageTitle}>Dictionary</h1>
                        <p style={styles.pageSubtitle}>{words.length} words saved</p>
                    </div>
                </div>
            </div>

            <div style={styles.card}>
                <div style={styles.filterRow}>
                    <input
                        type="text"
                        placeholder="Search words..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{...styles.input, ...styles.filterInput}}
                    />
                    <select
                        value={filterBookId}
                        onChange={(e) => setFilterBookId(e.target.value)}
                        style={{...styles.input, ...styles.filterSelect}}
                    >
                        <option value="all">All Books</option>
                        {books.map(book => (
                            <option key={book.id} value={book.id}>{book.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={styles.card}>Loading words...</div>
            ) : filteredWords.length === 0 ? (
                <div style={styles.card}>
                    <p style={styles.emptyState}>
                        {words.length === 0
                            ? 'No words saved yet. Start reading a book and click on words to translate and save them!'
                            : 'No words match your filter.'
                        }
                    </p>
                </div>
            ) : (
                <div style={styles.wordGrid}>
                    {filteredWords.map(word => (
                        <div key={word.id} style={styles.dictionaryCard}>
                            <div style={styles.wordHeader}>
                                <h3 style={styles.wordTitle}>{word.originalWord}</h3>
                                <span style={styles.wordLang}>{word.sourceLanguage} -> {word.targetLanguage}</span>
                            </div>
                            <p style={styles.wordTranslation}>{word.translatedWord}</p>

                            {word.context && (
                                <div style={styles.wordContextBox}>
                                    <span style={styles.contextLabel}>Context:</span>
                                    <p style={styles.wordContext}>"{word.context}"</p>
                                </div>
                            )}

                            {word.bookId && (
                                <div style={styles.wordBookInfo}>
                                    From: <strong>{getBookTitle(word.bookId)}</strong>
                                </div>
                            )}

                            <p style={styles.wordDate}>
                                Saved: {new Date(word.savedAt).toLocaleDateString()}
                            </p>

                            <div style={styles.wordActions}>
                                <button
                                    onClick={() => handleCreateFlashcard(word)}
                                    style={styles.createFlashcardButton}
                                >
                                    Create Flashcard
                                </button>
                                <button
                                    onClick={() => handleDelete(word.id)}
                                    style={{...styles.button, ...styles.deleteButton, ...styles.smallButton}}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default DictionaryPage;
