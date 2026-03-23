import React, { useState, useEffect } from 'react';
import { API_URL } from '../services/api';

const GrammarPage = ({ token }) => {
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedLevels, setExpandedLevels] = useState({});

    useEffect(() => {
        loadGrammarData();
    }, []);

    const loadGrammarData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/grammar`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLevels(data);
                // Expand all levels by default
                const expanded = {};
                data.forEach(level => {
                    expanded[level.level] = true;
                });
                setExpandedLevels(expanded);
            }
        } catch (error) {
            console.error('Error loading grammar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleLevel = (level) => {
        setExpandedLevels(prev => ({
            ...prev,
            [level]: !prev[level]
        }));
    };

    const handleTopicClick = async (topic) => {
        // Record visit
        try {
            await fetch(`${API_URL}/grammar/topics/${topic.id}/visit`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error recording visit:', error);
        }
        // Open in new tab
        window.open(topic.url, '_blank');
    };

    const toggleCompleted = async (e, topic) => {
        e.stopPropagation();
        try {
            const method = topic.completed ? 'DELETE' : 'POST';
            await fetch(`${API_URL}/grammar/topics/${topic.id}/complete`, {
                method,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Reload data
            loadGrammarData();
        } catch (error) {
            console.error('Error toggling completion:', error);
        }
    };

    const getTotalProgress = () => {
        const total = levels.reduce((sum, l) => sum + l.totalTopics, 0);
        const completed = levels.reduce((sum, l) => sum + l.completedTopics, 0);
        return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    const progress = getTotalProgress();

    const styles = {
        container: {
            padding: '20px',
            maxWidth: '900px',
            margin: '0 auto',
        },
        header: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            color: 'white',
        },
        headerTitle: {
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        headerSubtitle: {
            opacity: 0.9,
            fontSize: '14px',
            marginBottom: '16px',
        },
        progressBar: {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '10px',
            height: '12px',
            overflow: 'hidden',
        },
        progressFill: {
            background: 'white',
            height: '100%',
            borderRadius: '10px',
            transition: 'width 0.3s ease',
        },
        progressText: {
            marginTop: '8px',
            fontSize: '13px',
            opacity: 0.9,
        },
        levelCard: {
            background: 'white',
            borderRadius: '12px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'hidden',
        },
        levelHeader: {
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'background 0.2s',
        },
        levelInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        levelBadge: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '14px',
            color: 'white',
        },
        levelTitle: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
        },
        levelSubtitle: {
            fontSize: '13px',
            color: '#666',
            marginTop: '2px',
        },
        levelProgress: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        levelProgressText: {
            fontSize: '13px',
            color: '#666',
            fontWeight: '500',
        },
        chevron: {
            fontSize: '20px',
            color: '#999',
            transition: 'transform 0.2s',
        },
        topicsList: {
            borderTop: '1px solid #eee',
            padding: '8px 0',
        },
        topicItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            cursor: 'pointer',
            transition: 'background 0.2s',
            gap: '12px',
        },
        topicCheckbox: {
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            border: '2px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0,
        },
        topicCheckboxCompleted: {
            background: '#4CAF50',
            borderColor: '#4CAF50',
            color: 'white',
        },
        topicContent: {
            flex: 1,
        },
        topicName: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#333',
        },
        topicNameCompleted: {
            color: '#888',
        },
        topicDescription: {
            fontSize: '12px',
            color: '#888',
            marginTop: '2px',
        },
        topicLink: {
            fontSize: '12px',
            color: '#667eea',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        },
        loading: {
            textAlign: 'center',
            padding: '40px',
            color: '#666',
        },
        sourceNote: {
            textAlign: 'center',
            padding: '16px',
            color: '#888',
            fontSize: '12px',
        },
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading grammar resources...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header with overall progress */}
            <div style={styles.header}>
                <div style={styles.headerTitle}>
                    <span>Grammar Resources</span>
                </div>
                <div style={styles.headerSubtitle}>
                    Learn English grammar with lessons from British Council
                </div>
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progress.percent}%` }} />
                </div>
                <div style={styles.progressText}>
                    {progress.completed} of {progress.total} topics completed ({progress.percent}%)
                </div>
            </div>

            {/* Levels */}
            {levels.map(level => (
                <div key={level.level} style={styles.levelCard}>
                    <div
                        style={styles.levelHeader}
                        onClick={() => toggleLevel(level.level)}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                        <div style={styles.levelInfo}>
                            <div style={{ ...styles.levelBadge, background: level.color }}>
                                {level.level.split('-')[0]}
                            </div>
                            <div>
                                <div style={styles.levelTitle}>{level.level} - {level.name}</div>
                                <div style={styles.levelSubtitle}>
                                    {level.totalTopics} topics
                                </div>
                            </div>
                        </div>
                        <div style={styles.levelProgress}>
                            <div style={styles.levelProgressText}>
                                {level.completedTopics}/{level.totalTopics}
                            </div>
                            <div style={{
                                width: '60px',
                                height: '6px',
                                background: '#eee',
                                borderRadius: '3px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${(level.completedTopics / level.totalTopics) * 100}%`,
                                    height: '100%',
                                    background: level.color,
                                    borderRadius: '3px',
                                }} />
                            </div>
                            <span style={{
                                ...styles.chevron,
                                transform: expandedLevels[level.level] ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}>
                                ▼
                            </span>
                        </div>
                    </div>

                    {expandedLevels[level.level] && (
                        <div style={styles.topicsList}>
                            {level.topics.map(topic => (
                                <div
                                    key={topic.id}
                                    style={styles.topicItem}
                                    onClick={() => handleTopicClick(topic)}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div
                                        style={{
                                            ...styles.topicCheckbox,
                                            ...(topic.completed ? styles.topicCheckboxCompleted : {})
                                        }}
                                        onClick={(e) => toggleCompleted(e, topic)}
                                    >
                                        {topic.completed && '✓'}
                                    </div>
                                    <div style={styles.topicContent}>
                                        <div style={{
                                            ...styles.topicName,
                                            ...(topic.completed ? styles.topicNameCompleted : {})
                                        }}>
                                            {topic.name}
                                        </div>
                                        {topic.description && (
                                            <div style={styles.topicDescription}>
                                                {topic.description}
                                            </div>
                                        )}
                                    </div>
                                    <div style={styles.topicLink}>
                                        <span>Open</span>
                                        <span>↗</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            <div style={styles.sourceNote}>
                Content provided by <a href="https://learnenglish.britishcouncil.org/grammar" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>British Council LearnEnglish</a>
            </div>
        </div>
    );
};

export default GrammarPage;