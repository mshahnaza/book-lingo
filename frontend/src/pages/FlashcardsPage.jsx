import React, { useState, useEffect } from 'react';
import { API_URL, api } from '../services/api';
import { styles } from '../styles';

const FlashcardsPage = ({ token }) => {
    const [mode, setMode] = useState('menu');
    const [flashcards, setFlashcards] = useState([]);
    const [allFlashcards, setAllFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [createData, setCreateData] = useState({
        front: '',
        back: ''
    });
    const [loading, setLoading] = useState(false);
    const [reviewStartTime, setReviewStartTime] = useState(null);

    useEffect(() => {
        loadAllFlashcards();
    }, []);

    const loadDueFlashcards = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/flashcards/due`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setFlashcards(data);
            setCurrentIndex(0);
            setFlipped(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadAllFlashcards = async () => {
        try {
            const response = await fetch(`${API_URL}/flashcards`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setAllFlashcards(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleStartReview = async () => {
        await loadDueFlashcards();
        setMode('review');
    };

    const handleShowCard = () => {
        setFlipped(true);
        setReviewStartTime(Date.now());
    };

    const handleReview = async (quality) => {
        const flashcard = flashcards[currentIndex];
        const responseTime = reviewStartTime ? Math.round((Date.now() - reviewStartTime) / 1000) : 5;

        try {
            await fetch(`${API_URL}/flashcards/review`, {
                method: 'POST',
                headers: api.headers(token),
                body: JSON.stringify({
                    flashcardId: flashcard.id,
                    quality: quality,
                    responseTimeSeconds: responseTime
                })
            });

            if (currentIndex < flashcards.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setFlipped(false);
                setReviewStartTime(null);
            } else {
                await loadDueFlashcards();
                await loadAllFlashcards();
                if (flashcards.length <= 1) {
                    setMode('menu');
                }
            }
        } catch (error) {
            alert('Review failed: ' + error.message);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/flashcards`, {
                method: 'POST',
                headers: api.headers(token),
                body: JSON.stringify(createData)
            });

            if (response.ok) {
                setCreateData({ front: '', back: '' });
                await loadAllFlashcards();
                alert('Flashcard created successfully!');
            } else {
                const error = await response.json();
                alert('Create failed: ' + (error.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Create failed: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this flashcard?')) {
            try {
                await fetch(`${API_URL}/flashcards/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAllFlashcards(allFlashcards.filter(f => f.id !== id));
            } catch (error) {
                alert('Delete failed: ' + error.message);
            }
        }
    };

    const dueCount = allFlashcards.filter(f => {
        const today = new Date().toISOString().split('T')[0];
        return f.nextReviewDate <= today;
    }).length;

    if (mode === 'menu') {
        return (
            <>
                <div style={styles.pageHeader}>
                    <h1 style={styles.pageTitle}>Flashcards</h1>
                    <p style={styles.pageSubtitle}>Review and learn with spaced repetition</p>
                </div>

                <div style={styles.flashcardMenu}>
                    <div
                        style={{...styles.menuCard, ...styles.reviewCard}}
                        onClick={handleStartReview}
                    >
                        <div style={styles.menuCardIcon}>
                            <span style={styles.dueCount}>{dueCount}</span>
                        </div>
                        <h3 style={styles.menuCardTitle}>Review Due Cards</h3>
                        <p style={styles.menuCardDesc}>
                            {dueCount > 0
                                ? `${dueCount} cards waiting for review`
                                : 'No cards due for review!'
                            }
                        </p>
                    </div>

                    <div
                        style={{...styles.menuCard, ...styles.allCardsCard}}
                        onClick={() => setMode('all')}
                    >
                        <div style={styles.menuCardIcon}>
                            <span style={styles.totalCount}>{allFlashcards.length}</span>
                        </div>
                        <h3 style={styles.menuCardTitle}>All Flashcards</h3>
                        <p style={styles.menuCardDesc}>View and manage all your flashcards</p>
                    </div>

                    <div
                        style={{...styles.menuCard, ...styles.createCard}}
                        onClick={() => setMode('create')}
                    >
                        <div style={styles.menuCardIcon}>
                            <span style={styles.plusIcon}>+</span>
                        </div>
                        <h3 style={styles.menuCardTitle}>Create New</h3>
                        <p style={styles.menuCardDesc}>Add a new flashcard manually</p>
                    </div>
                </div>
            </>
        );
    }

    if (mode === 'review') {
        if (loading) {
            return (
                <div style={styles.card}>
                    <p>Loading flashcards...</p>
                </div>
            );
        }

        if (flashcards.length === 0) {
            return (
                <>
                    <div style={styles.pageHeader}>
                        <div style={styles.headerFlex}>
                            <h1 style={styles.pageTitle}>Review Complete!</h1>
                            <button style={styles.button} onClick={() => setMode('menu')}>
                                Back to Menu
                            </button>
                        </div>
                    </div>
                    <div style={styles.card}>
                        <p style={styles.emptyState}>No flashcards due for review. Great job!</p>
                    </div>
                </>
            );
        }

        const currentCard = flashcards[currentIndex];

        return (
            <>
                <div style={styles.pageHeader}>
                    <div style={styles.headerFlex}>
                        <div>
                            <h1 style={styles.pageTitle}>Review Session</h1>
                            <p style={styles.pageSubtitle}>
                                Card {currentIndex + 1} of {flashcards.length}
                            </p>
                        </div>
                        <button style={styles.button} onClick={() => setMode('menu')}>
                            End Review
                        </button>
                    </div>
                </div>

                <div style={styles.reviewContainer}>
                    <div style={styles.reviewProgress}>
                        <div
                            style={{
                                ...styles.reviewProgressFill,
                                width: `${((currentIndex) / flashcards.length) * 100}%`
                            }}
                        />
                    </div>

                    <div
                        style={flipped ? {...styles.flashcard, ...styles.flashcardFlipped} : styles.flashcard}
                        onClick={() => !flipped && handleShowCard()}
                    >
                        <div style={flipped ? styles.flashcardContentBack : styles.flashcardContent}>
                            {flipped ? currentCard.back : currentCard.front}
                        </div>
                        {!flipped && (
                            <p style={styles.flipHint}>Click to reveal answer</p>
                        )}
                    </div>

                    {flipped && (
                        <div style={styles.reviewButtonsContainer}>
                            <p style={styles.reviewPrompt}>How well did you remember?</p>
                            <div style={styles.reviewButtons}>
                                <button
                                    onClick={() => handleReview(0)}
                                    style={{...styles.reviewButton, ...styles.reviewAgain}}
                                >
                                    <span style={styles.reviewButtonLabel}>Again</span>
                                    <span style={styles.reviewButtonDesc}>Complete blackout</span>
                                </button>
                                <button
                                    onClick={() => handleReview(2)}
                                    style={{...styles.reviewButton, ...styles.reviewHard}}
                                >
                                    <span style={styles.reviewButtonLabel}>Hard</span>
                                    <span style={styles.reviewButtonDesc}>Significant difficulty</span>
                                </button>
                                <button
                                    onClick={() => handleReview(3)}
                                    style={{...styles.reviewButton, ...styles.reviewGood}}
                                >
                                    <span style={styles.reviewButtonLabel}>Good</span>
                                    <span style={styles.reviewButtonDesc}>Some hesitation</span>
                                </button>
                                <button
                                    onClick={() => handleReview(5)}
                                    style={{...styles.reviewButton, ...styles.reviewEasy}}
                                >
                                    <span style={styles.reviewButtonLabel}>Easy</span>
                                    <span style={styles.reviewButtonDesc}>Perfect response</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }

    if (mode === 'all') {
        return (
            <>
                <div style={styles.pageHeader}>
                    <div style={styles.headerFlex}>
                        <div>
                            <h1 style={styles.pageTitle}>All Flashcards</h1>
                            <p style={styles.pageSubtitle}>{allFlashcards.length} flashcards total</p>
                        </div>
                        <button style={styles.button} onClick={() => setMode('menu')}>
                            Back to Menu
                        </button>
                    </div>
                </div>

                {allFlashcards.length === 0 ? (
                    <div style={styles.card}>
                        <p style={styles.emptyState}>No flashcards yet. Create your first one!</p>
                    </div>
                ) : (
                    <div style={styles.flashcardGrid}>
                        {allFlashcards.map(card => {
                            const isDue = card.nextReviewDate <= new Date().toISOString().split('T')[0];
                            return (
                                <div key={card.id} style={{...styles.flashcardItem, ...(isDue ? styles.flashcardDue : {})}}>
                                    <div style={styles.flashcardItemHeader}>
                                        <span style={styles.flashcardFront}>{card.front}</span>
                                        {isDue && <span style={styles.dueBadge}>Due</span>}
                                    </div>
                                    <p style={styles.flashcardBack}>{card.back}</p>
                                    <div style={styles.flashcardMeta}>
                                        <span>Ease: {card.easeFactor?.toFixed(2)}</span>
                                        <span>Interval: {card.intervalDays} days</span>
                                        <span>Reviews: {card.repetitions}</span>
                                    </div>
                                    <p style={styles.flashcardNextReview}>
                                        Next review: {card.nextReviewDate}
                                    </p>
                                    <button
                                        onClick={() => handleDelete(card.id)}
                                        style={{...styles.button, ...styles.deleteButton, ...styles.smallButton}}
                                    >
                                        Delete
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </>
        );
    }

    if (mode === 'create') {
        return (
            <>
                <div style={styles.pageHeader}>
                    <div style={styles.headerFlex}>
                        <h1 style={styles.pageTitle}>Create Flashcard</h1>
                        <button style={styles.button} onClick={() => setMode('menu')}>
                            Back to Menu
                        </button>
                    </div>
                </div>

                <div style={styles.card}>
                    <form onSubmit={handleCreate}>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Front (Question)</label>
                            <textarea
                                style={styles.textarea}
                                placeholder="Enter the question or word..."
                                value={createData.front}
                                onChange={(e) => setCreateData({...createData, front: e.target.value})}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Back (Answer)</label>
                            <textarea
                                style={styles.textarea}
                                placeholder="Enter the answer or translation..."
                                value={createData.back}
                                onChange={(e) => setCreateData({...createData, back: e.target.value})}
                                required
                            />
                        </div>
                        <button type="submit" style={styles.button}>Create Flashcard</button>
                    </form>
                </div>
            </>
        );
    }

    return null;
};

export default FlashcardsPage;
