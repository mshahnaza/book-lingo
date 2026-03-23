import React, { useState, useEffect, useRef } from 'react';
import { theme } from './styles/theme';
import { Button, Card, Input, Avatar } from './components/common';
import { Layout, Header } from './components/layout';
import GrammarPage from './pages/GrammarPage';

const API_URL = 'http://localhost:8080/api';

const api = {
    headers: (token) => ({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }),
};

// Global Styles
const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background: ${theme.colors.dark};
        color: ${theme.colors.textPrimary};
        min-height: 100vh;
        -webkit-font-smoothing: antialiased;
    }

    ::selection {
        background: ${theme.colors.accent}40;
    }

    input::placeholder {
        color: ${theme.colors.textMuted};
    }

    ::-webkit-scrollbar {
        width: 6px;
    }

    ::-webkit-scrollbar-track {
        background: ${theme.colors.darkSecondary};
    }

    ::-webkit-scrollbar-thumb {
        background: ${theme.colors.border};
        border-radius: 3px;
    }
`;

// Supported languages
const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Russian' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'tr', name: 'Turkish' },
];

// Toast notification component
const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: theme.colors.success,
        error: theme.colors.error,
        info: theme.colors.info,
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: colors[type] || colors.info,
            color: theme.colors.textDark,
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            borderRadius: theme.borderRadius.md,
            fontWeight: theme.fontWeight.medium,
            zIndex: 2000,
            boxShadow: theme.shadows.lg,
        }}>
            {message}
        </div>
    );
};

// Main App
const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedBook, setSelectedBook] = useState(null);
    const [nativeLanguage, setNativeLanguage] = useState(localStorage.getItem('nativeLanguage') || 'en');
    const [toast, setToast] = useState(null);
    const [isValidating, setIsValidating] = useState(true);

    // Validate token on app load
    useEffect(() => {
        const validateToken = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setIsValidating(false);
                return;
            }

            try {
                // Try to fetch user data to validate token
                const response = await fetch(`${API_URL}/statistics`, {
                    headers: { 'Authorization': `Bearer ${storedToken}` }
                });

                if (response.ok) {
                    setToken(storedToken);
                } else if (response.status === 401 || response.status === 403) {
                    // Token is invalid or expired
                    localStorage.removeItem('token');
                    setToken(null);
                }
            } catch (error) {
                // Network error - keep token but try to continue
                console.error('Token validation failed:', error);
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleLanguageChange = (lang) => {
        setNativeLanguage(lang);
        localStorage.setItem('nativeLanguage', lang);
    };

    const handleLogin = (accessToken, userData) => {
        setToken(accessToken);
        setUser(userData);
        localStorage.setItem('token', accessToken);
        setIsValidating(false);
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        setCurrentPage('dashboard');
        setSelectedBook(null);
    };

    const handleOpenBook = async (book) => {
        // Fetch fresh book data to get latest reading position
        try {
            const response = await fetch(`${API_URL}/books/${book.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const freshBook = await response.json();
                setSelectedBook(freshBook);
            } else {
                setSelectedBook(book); // Fallback to passed book
            }
        } catch (error) {
            setSelectedBook(book); // Fallback to passed book
        }
        setCurrentPage('reader');
    };

    const handleCloseReader = () => {
        setSelectedBook(null);
        setCurrentPage('books');
    };

    // Show loading while validating token
    if (isValidating) {
        return (
            <div style={{
                minHeight: '100vh',
                background: theme.colors.dark,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <style>{globalStyles}</style>
                <p style={{ color: theme.colors.textSecondary }}>Loading...</p>
            </div>
        );
    }

    // Show login page if not authenticated
    if (!token) {
        return <LoginPage onLogin={handleLogin} />;
    }

    if (currentPage === 'reader' && selectedBook) {
        return (
            <>
                <style>{globalStyles}</style>
                <BookReaderPage
                    token={token}
                    book={selectedBook}
                    onClose={handleCloseReader}
                    nativeLanguage={nativeLanguage}
                    onLanguageChange={handleLanguageChange}
                    showToast={showToast}
                />
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </>
        );
    }

    const isAdmin = user?.role === 'ADMIN';

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage token={token} user={user} onLogout={handleLogout} onNavigate={setCurrentPage} onOpenBook={handleOpenBook} />;
            case 'daily':
                return <DailyChallengePage token={token} showToast={showToast} />;
            case 'books':
                return <BooksPage token={token} onOpenBook={handleOpenBook} showToast={showToast} />;
            case 'dictionary':
                return <DictionaryPage token={token} showToast={showToast} />;
            case 'flashcards':
                return <FlashcardsPage token={token} showToast={showToast} />;
            case 'grammar':
                return <GrammarPage token={token} showToast={showToast} />;
            case 'admin':
                return isAdmin ? <AdminPage token={token} showToast={showToast} /> : <DashboardPage token={token} user={user} onLogout={handleLogout} onNavigate={setCurrentPage} onOpenBook={handleOpenBook} />;
            default:
                return <DashboardPage token={token} user={user} onLogout={handleLogout} />;
        }
    };

    return (
        <>
            <style>{globalStyles}</style>
            <Layout currentPage={currentPage} onNavigate={setCurrentPage} isAdmin={isAdmin}>
                {renderPage()}
            </Layout>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
};

// Login Page
const LoginPage = ({ onLogin }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/auth/${isRegister ? 'register' : 'login'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                // AuthResponse has user fields at top level, not nested
                const userData = {
                    username: data.username,
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: data.role
                };
                onLogin(data.accessToken, userData);
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (error) {
            setError('Network error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: theme.colors.dark,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.lg,
        }}>
            <style>{globalStyles}</style>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: theme.spacing.xl }}>
                    <Avatar text="BL" size="xl" style={{ margin: '0 auto', marginBottom: theme.spacing.lg }} />
                    <h1 style={{
                        fontSize: theme.fontSize.xxl,
                        fontWeight: theme.fontWeight.bold,
                        color: theme.colors.textPrimary,
                        marginBottom: theme.spacing.sm,
                    }}>
                        BookLingo
                    </h1>
                    <p style={{ color: theme.colors.textSecondary }}>
                        {isRegister ? 'Create your account' : 'Welcome back'}
                    </p>
                </div>

                <Card variant="dark" padding="lg">
                    {error && (
                        <div style={{
                            background: `${theme.colors.error}20`,
                            color: theme.colors.error,
                            padding: theme.spacing.md,
                            borderRadius: theme.borderRadius.md,
                            marginBottom: theme.spacing.lg,
                            fontSize: theme.fontSize.sm,
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                            <Input
                                type="text"
                                placeholder="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                            {isRegister && (
                                <>
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                    <div style={{ display: 'flex', gap: theme.spacing.md }}>
                                        <Input
                                            type="text"
                                            placeholder="First Name"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            required
                                        />
                                        <Input
                                            type="text"
                                            placeholder="Last Name"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </>
                            )}
                            <Input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <Button type="submit" fullWidth disabled={loading}>
                                {loading ? 'Loading...' : (isRegister ? 'Create Account' : 'Sign In')}
                            </Button>
                        </div>
                    </form>

                    <p style={{
                        textAlign: 'center',
                        marginTop: theme.spacing.lg,
                        color: theme.colors.textSecondary,
                        fontSize: theme.fontSize.sm,
                    }}>
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}
                        <span
                            onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            style={{
                                color: theme.colors.accent,
                                cursor: 'pointer',
                                marginLeft: theme.spacing.xs,
                                fontWeight: theme.fontWeight.semibold,
                            }}
                        >
                            {isRegister ? 'Sign In' : 'Register'}
                        </span>
                    </p>
                </Card>
            </div>
        </div>
    );
};

// Dashboard Page
const DashboardPage = ({ token, user, onLogout, onNavigate, onOpenBook }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastBook, setLastBook] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/statistics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => { setStats(data); setLoading(false); })
            .catch(() => setLoading(false));

        // Load last READ book for "Continue Reading" (sort by lastReadAt)
        fetch(`${API_URL}/books`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(books => {
                if (books.length > 0) {
                    // Sort by lastReadAt descending, books without lastReadAt go to end
                    const sortedBooks = [...books].sort((a, b) => {
                        if (!a.lastReadAt && !b.lastReadAt) return 0;
                        if (!a.lastReadAt) return 1;
                        if (!b.lastReadAt) return -1;
                        return new Date(b.lastReadAt) - new Date(a.lastReadAt);
                    });
                    // Get the most recently read book
                    const lastRead = sortedBooks.find(b => b.lastReadAt) || sortedBooks[0];
                    setLastBook(lastRead);
                }
            })
            .catch(() => {});
    }, [token]);

    return (
        <>
            <Header title="BookLingo" subtitle="Your learning journey" user={user} />

            {/* User Profile Card */}
            <Card variant="dark" style={{ marginBottom: theme.spacing.lg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
                    <Avatar text={user?.username || 'U'} size="lg" />
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            fontSize: theme.fontSize.lg,
                            fontWeight: theme.fontWeight.semibold,
                            color: theme.colors.textPrimary,
                        }}>
                            {user?.firstName || user?.username || 'User'}
                        </h3>
                        <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
                            Keep learning every day
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onLogout}>
                        Logout
                    </Button>
                </div>
            </Card>

            {/* Stats Section */}
            <div style={{ marginBottom: theme.spacing.lg }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: theme.spacing.md,
                }}>
                    <h2 style={{
                        fontSize: theme.fontSize.lg,
                        fontWeight: theme.fontWeight.semibold,
                        color: theme.colors.textPrimary,
                    }}>
                        Statistics
                    </h2>
                </div>

                {loading ? (
                    <Card variant="dark">
                        <p style={{ color: theme.colors.textSecondary }}>Loading...</p>
                    </Card>
                ) : stats ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: theme.spacing.md,
                    }}>
                        <StatCard value={stats.totalBooks || 0} label="Books" />
                        <StatCard value={stats.totalWords || 0} label="Words" />
                        <StatCard value={stats.totalFlashcards || 0} label="Flashcards" />
                        <StatCard value={stats.flashcardsDueToday || 0} label="Due Today" highlight />
                    </div>
                ) : (
                    <Card variant="dark">
                        <p style={{ color: theme.colors.textSecondary }}>Failed to load stats</p>
                    </Card>
                )}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 style={{
                    fontSize: theme.fontSize.lg,
                    fontWeight: theme.fontWeight.semibold,
                    color: theme.colors.textPrimary,
                    marginBottom: theme.spacing.md,
                }}>
                    Quick Actions
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    <QuickActionCard
                        title="Continue Reading"
                        subtitle={lastBook ? lastBook.title : "Pick up where you left off"}
                        icon="book"
                        onClick={() => lastBook ? onOpenBook(lastBook) : onNavigate('books')}
                    />
                    <QuickActionCard
                        title="Review Flashcards"
                        subtitle={`${stats?.flashcardsDueToday || 0} cards due today`}
                        icon="cards"
                        highlight
                        onClick={() => onNavigate('flashcards')}
                    />
                </div>
            </div>
        </>
    );
};

const StatCard = ({ value, label, highlight }) => (
    <Card variant="dark" padding="md">
        <p style={{
            fontSize: theme.fontSize.xxl,
            fontWeight: theme.fontWeight.bold,
            color: highlight ? theme.colors.accent : theme.colors.textPrimary,
            marginBottom: theme.spacing.xs,
        }}>
            {value}
        </p>
        <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
            {label}
        </p>
    </Card>
);

const QuickActionCard = ({ title, subtitle, icon, highlight, onClick }) => (
    <Card
        variant="dark"
        padding="md"
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.md,
            cursor: 'pointer',
            border: highlight ? `1px solid ${theme.colors.accent}40` : 'none',
        }}
    >
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: theme.borderRadius.md,
            background: highlight ? theme.colors.accent : theme.colors.darkSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: highlight ? theme.colors.textDark : theme.colors.textSecondary,
        }}>
            {icon === 'book' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M7 8h10"/>
                    <path d="M7 12h6"/>
                </svg>
            )}
        </div>
        <div style={{ flex: 1 }}>
            <h4 style={{
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.semibold,
                color: theme.colors.textPrimary,
                marginBottom: '2px',
            }}>
                {title}
            </h4>
            <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
                {subtitle}
            </p>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.colors.textMuted} strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
        </svg>
    </Card>
);

// Books Page
const BooksPage = ({ token, onOpenBook, showToast }) => {
    const [books, setBooks] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadData, setUploadData] = useState({ title: '', author: '', language: '' });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => { loadBooks(); }, []);

    const loadBooks = () => {
        setLoading(true);
        fetch(`${API_URL}/books`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { setBooks(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', uploadData.title);
        formData.append('author', uploadData.author);
        formData.append('language', uploadData.language);

        try {
            const response = await fetch(`${API_URL}/books`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (response.ok) {
                setShowUpload(false);
                setUploadData({ title: '', author: '', language: '' });
                setFile(null);
                loadBooks();
                showToast('Book uploaded successfully!', 'success');
            } else {
                const error = await response.json();
                showToast('Upload failed: ' + (error.message || 'Unknown error'), 'error');
            }
        } catch (error) {
            showToast('Upload failed: ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Delete this book?')) {
            try {
                await fetch(`${API_URL}/books/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                loadBooks();
                showToast('Book deleted', 'success');
            } catch (error) {
                showToast('Delete failed: ' + error.message, 'error');
            }
        }
    };

    return (
        <>
            <Header title="My Books" subtitle={`${books.length} books in your library`} />

            <Button
                fullWidth
                onClick={() => setShowUpload(!showUpload)}
                style={{ marginBottom: theme.spacing.lg }}
            >
                {showUpload ? 'Cancel' : '+ Upload Book'}
            </Button>

            {showUpload && (
                <Card variant="dark" style={{ marginBottom: theme.spacing.lg }}>
                    <form onSubmit={handleUpload}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                            <Input
                                placeholder="Book Title"
                                value={uploadData.title}
                                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                required
                            />
                            <Input
                                placeholder="Author"
                                value={uploadData.author}
                                onChange={(e) => setUploadData({ ...uploadData, author: e.target.value })}
                                required
                            />
                            <Input
                                placeholder="Language (en, ru, es...)"
                                value={uploadData.language}
                                onChange={(e) => setUploadData({ ...uploadData, language: e.target.value })}
                                required
                            />
                            <div
                                onClick={() => document.getElementById('file-input').click()}
                                style={{
                                    padding: theme.spacing.lg,
                                    border: `2px dashed ${theme.colors.border}`,
                                    borderRadius: theme.borderRadius.md,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    color: file ? theme.colors.accent : theme.colors.textSecondary,
                                }}
                            >
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    style={{ display: 'none' }}
                                />
                                {file ? file.name : 'Choose PDF or TXT file'}
                            </div>
                            <Button type="submit" disabled={uploading || !file}>
                                {uploading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {loading ? (
                <Card variant="dark">
                    <p style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>Loading...</p>
                </Card>
            ) : books.length === 0 ? (
                <Card variant="dark">
                    <p style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
                        No books yet. Upload your first book!
                    </p>
                </Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    {books.map(book => (
                        <Card
                            key={book.id}
                            variant="dark"
                            onClick={() => onOpenBook(book)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', gap: theme.spacing.md }}>
                                <Avatar text={book.title} size="lg" />
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        fontSize: theme.fontSize.md,
                                        fontWeight: theme.fontWeight.semibold,
                                        color: theme.colors.textPrimary,
                                        marginBottom: '4px',
                                    }}>
                                        {book.title}
                                    </h3>
                                    <p style={{
                                        color: theme.colors.textSecondary,
                                        fontSize: theme.fontSize.sm,
                                        marginBottom: theme.spacing.sm,
                                    }}>
                                        {book.author}
                                    </p>
                                    <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            background: theme.colors.darkSecondary,
                                            borderRadius: theme.borderRadius.sm,
                                            fontSize: theme.fontSize.xs,
                                            color: theme.colors.textSecondary,
                                        }}>
                                            {book.language}
                                        </span>
                                        <span style={{
                                            padding: '4px 8px',
                                            background: theme.colors.darkSecondary,
                                            borderRadius: theme.borderRadius.sm,
                                            fontSize: theme.fontSize.xs,
                                            color: theme.colors.textSecondary,
                                        }}>
                                            {book.totalPages} pages
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={(e) => handleDelete(book.id, e)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
};

// Book Reader Page
const BookReaderPage = ({ token, book, onClose, nativeLanguage, onLanguageChange, showToast }) => {
    const [displayMode, setDisplayMode] = useState('pages');
    const [currentPageNum, setCurrentPageNum] = useState(book.currentPage || 1);
    const [pageContent, setPageContent] = useState('');
    const [allPages, setAllPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTranslation, setShowTranslation] = useState(false);
    const [translationData, setTranslationData] = useState({ word: '', translation: '', context: '', position: { x: 0, y: 0 } });
    const [translating, setTranslating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [jumpToPage, setJumpToPage] = useState('');
    const [showJumpInput, setShowJumpInput] = useState(false);
    // If native language is same as book language, pick a different target language
    const getInitialTargetLang = () => {
        if (nativeLanguage === book.language) {
            // Find first available language that's not the book's language
            const available = LANGUAGES.find(l => l.code !== book.language);
            return available ? available.code : 'en';
        }
        return nativeLanguage;
    };
    const [targetLang, setTargetLang] = useState(getInitialTargetLang);
    const scrollContainerRef = useRef(null);
    const pageRefs = useRef({});
    const currentPageRef = useRef(currentPageNum);

    // Save reading position when page changes or on close
    const saveReadingPosition = async (pageNum) => {
        try {
            await fetch(`${API_URL}/books/${book.id}/position?page=${pageNum}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to save reading position');
        }
    };

    // Save position when leaving
    const handleClose = () => {
        saveReadingPosition(currentPageNum);
        onClose();
    };

    // Save position when page changes (debounced)
    useEffect(() => {
        currentPageRef.current = currentPageNum;

        // Debounce saving to avoid too many API calls while scrolling
        const timeoutId = setTimeout(() => {
            saveReadingPosition(currentPageNum);
        }, 1000); // Save after 1 second of no page change

        return () => clearTimeout(timeoutId);
    }, [currentPageNum]);

    useEffect(() => {
        if (book) {
            if (displayMode === 'scroll') {
                loadAllPages();
            }
        }
    }, [book, displayMode]);

    useEffect(() => {
        if (book && displayMode === 'pages') {
            loadPage(currentPageNum);
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
                    if (rect.top <= containerTop + containerRect.height / 2) {
                        currentVisiblePage = parseInt(pageNum);
                    }
                }
            });
            if (currentVisiblePage !== currentPageRef.current) {
                setCurrentPageNum(currentVisiblePage);
            }
        };

        const timeoutId = setTimeout(() => {
            const container = scrollContainerRef.current;
            if (container) {
                container.addEventListener('scroll', handleScroll);

                // Scroll to saved position when entering scroll mode
                const savedPage = currentPageNum;
                if (savedPage > 1 && pageRefs.current[savedPage]) {
                    pageRefs.current[savedPage].scrollIntoView({ behavior: 'auto' });
                }
            }
        }, 100); // Give React time to render and populate refs
        return () => {
            clearTimeout(timeoutId);
            const container = scrollContainerRef.current;
            if (container) container.removeEventListener('scroll', handleScroll);
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
            }
        } catch (error) {
            setPageContent('Error loading page');
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
            }
        } catch (error) {
            setAllPages([]);
        } finally {
            setLoading(false);
        }
    };

    const translateWord = async (word, targetLanguage) => {
        setTranslating(true);
        try {
            const response = await fetch(
                `${API_URL}/words/translate?word=${encodeURIComponent(word)}&sourceLanguage=${book.language}&targetLanguage=${targetLanguage}`,
                { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }
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
    };

    const extractSentence = (text, word) => {
        if (!text || !word) return word;
        // Normalize: replace newlines and multiple spaces with single space
        const normalizedText = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
        const wordLower = word.toLowerCase();
        const textLower = normalizedText.toLowerCase();
        const wordIndex = textLower.indexOf(wordLower);
        if (wordIndex === -1) return word;

        // Find sentence start - go back until we find . ! ? followed by space
        let sentenceStart = wordIndex;
        while (sentenceStart > 0) {
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
                sentenceEnd++;
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
            sentence = (start > 0 ? '...' : '') + sentence.substring(start, end).trim() + (end < sentence.length ? '...' : '');
        }
        return sentence;
    };

    const handleTextSelection = async () => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        if (selectedText && selectedText.length > 0 && selectedText.length < 100) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Get full page text from state
            let fullText = '';
            if (displayMode === 'scroll') {
                for (const page of allPages) {
                    if (page.textContent && page.textContent.toLowerCase().includes(selectedText.toLowerCase())) {
                        fullText = page.textContent;
                        break;
                    }
                }
            } else {
                fullText = pageContent;
            }

            // Extract complete sentence containing the word
            const context = fullText ? extractSentence(fullText, selectedText) : selectedText;

            setTranslationData({ word: selectedText, translation: '', context, position: { x: rect.left, y: rect.bottom + 10 } });
            setShowTranslation(true);
            translateWord(selectedText, targetLang);
        }
    };

    const handleLanguageSwitch = (newLang) => {
        setTargetLang(newLang);
        onLanguageChange(newLang);
        if (translationData.word) {
            translateWord(translationData.word, newLang);
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
                    targetLanguage: targetLang,
                    context: translationData.context,
                    bookId: book.id
                })
            });
            if (response.ok) {
                setShowTranslation(false);
                showToast('Word saved to dictionary!', 'success');
            } else {
                showToast('Failed to save word', 'error');
            }
        } catch (error) {
            showToast('Error saving word', 'error');
        } finally {
            setSaving(false);
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: theme.colors.dark }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: theme.spacing.md,
                background: theme.colors.darkSecondary,
                borderBottom: `1px solid ${theme.colors.border}`,
            }}>
                <Button variant="ghost" size="sm" onClick={handleClose}>
                    Back
                </Button>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.textPrimary }}>
                        {book.title}
                    </h2>
                    <span style={{ fontSize: theme.fontSize.xs, color: theme.colors.textSecondary }}>
                        {book.author}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setDisplayMode(displayMode === 'pages' ? 'scroll' : 'pages')}
                    >
                        {displayMode === 'pages' ? 'Scroll' : 'Pages'}
                    </Button>
                    <div
                        onClick={() => setShowJumpInput(!showJumpInput)}
                        style={{
                            padding: '8px 12px',
                            background: theme.colors.darkCard,
                            borderRadius: theme.borderRadius.md,
                            fontSize: theme.fontSize.sm,
                            color: theme.colors.textPrimary,
                            cursor: 'pointer',
                        }}
                    >
                        {showJumpInput ? (
                            <form onSubmit={handleJumpToPage} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                    type="number"
                                    min="1"
                                    max={book.totalPages}
                                    value={jumpToPage}
                                    onChange={(e) => setJumpToPage(e.target.value)}
                                    style={{
                                        width: '40px',
                                        padding: '2px 4px',
                                        background: theme.colors.darkSecondary,
                                        border: `1px solid ${theme.colors.accent}`,
                                        borderRadius: '4px',
                                        color: theme.colors.textPrimary,
                                        textAlign: 'center',
                                        fontSize: theme.fontSize.sm,
                                    }}
                                    autoFocus
                                />
                                <span>/ {book.totalPages}</span>
                            </form>
                        ) : (
                            <span>{currentPageNum} / {book.totalPages}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div
                ref={scrollContainerRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: theme.spacing.lg,
                }}
                onMouseUp={handleTextSelection}
            >
                {loading ? (
                    <p style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>Loading...</p>
                ) : displayMode === 'scroll' ? (
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        {allPages.map((page, idx) => (
                            <div
                                key={page.id || idx}
                                ref={el => pageRefs.current[page.pageNumber] = el}
                                style={{
                                    marginBottom: theme.spacing.xl,
                                    paddingBottom: theme.spacing.xl,
                                    borderBottom: `1px solid ${theme.colors.border}`,
                                }}
                            >
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    background: theme.colors.darkCard,
                                    borderRadius: theme.borderRadius.sm,
                                    fontSize: theme.fontSize.xs,
                                    color: theme.colors.textSecondary,
                                    marginBottom: theme.spacing.md,
                                }}>
                                    Page {page.pageNumber}
                                </span>
                                <div style={{
                                    fontSize: theme.fontSize.lg,
                                    lineHeight: '1.8',
                                    color: theme.colors.textPrimary,
                                    whiteSpace: 'pre-wrap',
                                }}>
                                    {page.textContent || ''}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        maxWidth: '700px',
                        margin: '0 auto',
                        fontSize: theme.fontSize.lg,
                        lineHeight: '1.8',
                        color: theme.colors.textPrimary,
                        whiteSpace: 'pre-wrap',
                    }}>
                        {pageContent}
                    </div>
                )}
            </div>

            {/* Translation Popup */}
            {showTranslation && (
                <div style={{
                    position: 'fixed',
                    left: Math.min(translationData.position.x, window.innerWidth - 300),
                    top: Math.min(translationData.position.y, window.innerHeight - 250),
                    background: theme.colors.darkCard,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    minWidth: '280px',
                    maxWidth: '320px',
                    boxShadow: theme.shadows.lg,
                    zIndex: 1000,
                    border: `1px solid ${theme.colors.border}`,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                        <span style={{ fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.textPrimary }}>
                            {translationData.word}
                        </span>
                        <button
                            onClick={() => setShowTranslation(false)}
                            style={{ background: 'none', border: 'none', color: theme.colors.textSecondary, cursor: 'pointer', fontSize: '18px' }}
                        >
                            x
                        </button>
                    </div>
                    {/* Language selector */}
                    <div style={{ marginBottom: theme.spacing.md }}>
                        <select
                            value={targetLang}
                            onChange={(e) => handleLanguageSwitch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: theme.colors.darkSecondary,
                                border: `1px solid ${theme.colors.border}`,
                                borderRadius: theme.borderRadius.sm,
                                color: theme.colors.textPrimary,
                                fontSize: theme.fontSize.sm,
                                cursor: 'pointer',
                            }}
                        >
                            {LANGUAGES.filter(l => l.code !== book.language).map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginBottom: theme.spacing.md }}>
                        {translating ? (
                            <span style={{ color: theme.colors.textSecondary }}>Translating...</span>
                        ) : (
                            <span style={{ fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.semibold, color: theme.colors.accent }}>
                                {translationData.translation}
                            </span>
                        )}
                    </div>
                    {translationData.context && (
                        <div style={{
                            padding: theme.spacing.sm,
                            background: theme.colors.darkSecondary,
                            borderRadius: theme.borderRadius.sm,
                            marginBottom: theme.spacing.md,
                            fontSize: theme.fontSize.sm,
                            color: theme.colors.textSecondary,
                            fontStyle: 'italic',
                        }}>
                            "{translationData.context}"
                        </div>
                    )}
                    <Button fullWidth onClick={handleSaveWord} disabled={saving || translating}>
                        {saving ? 'Saving...' : 'Add to Dictionary'}
                    </Button>
                </div>
            )}

            {/* Footer Navigation (Page Mode) */}
            {displayMode === 'pages' && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: theme.spacing.md,
                    background: theme.colors.darkSecondary,
                    borderTop: `1px solid ${theme.colors.border}`,
                }}>
                    <Button
                        variant="secondary"
                        onClick={() => currentPageNum > 1 && setCurrentPageNum(currentPageNum - 1)}
                        disabled={currentPageNum <= 1}
                    >
                        Previous
                    </Button>
                    <div style={{
                        flex: 1,
                        height: '4px',
                        background: theme.colors.darkCard,
                        borderRadius: '2px',
                        margin: `0 ${theme.spacing.lg}`,
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: `${(currentPageNum / book.totalPages) * 100}%`,
                            height: '100%',
                            background: theme.colors.accent,
                            borderRadius: '2px',
                            transition: 'width 0.3s ease',
                        }} />
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => currentPageNum < book.totalPages && setCurrentPageNum(currentPageNum + 1)}
                        disabled={currentPageNum >= book.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

// Dictionary Page
const DictionaryPage = ({ token, showToast }) => {
    const [words, setWords] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterBookId, setFilterBookId] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/words`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
            fetch(`${API_URL}/books`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
        ]).then(([wordsData, booksData]) => {
            setWords(wordsData);
            setBooks(booksData);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [token]);

    const handleDelete = async (id) => {
        if (window.confirm('Delete this word?')) {
            await fetch(`${API_URL}/words/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            setWords(words.filter(w => w.id !== id));
        }
    };

    const handleCreateFlashcard = async (word) => {
        try {
            const response = await fetch(`${API_URL}/flashcards`, {
                method: 'POST',
                headers: api.headers(token),
                body: JSON.stringify({ front: word.originalWord, back: word.translatedWord, wordId: word.id })
            });
            if (response.ok) {
                showToast('Flashcard created!', 'success');
            } else {
                showToast('Failed to create flashcard', 'error');
            }
        } catch (error) {
            showToast('Error creating flashcard', 'error');
        }
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
            <Header title="Dictionary" subtitle={`${words.length} words saved`} />

            {/* Filters */}
            <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
                <Input
                    placeholder="Search words..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1 }}
                />
                <select
                    value={filterBookId}
                    onChange={(e) => setFilterBookId(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        background: theme.colors.darkSecondary,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: theme.borderRadius.md,
                        color: theme.colors.textPrimary,
                        fontSize: theme.fontSize.md,
                        cursor: 'pointer',
                    }}
                >
                    <option value="all">All Books</option>
                    {books.map(book => <option key={book.id} value={book.id}>{book.title}</option>)}
                </select>
            </div>

            {loading ? (
                <Card variant="dark">
                    <p style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>Loading...</p>
                </Card>
            ) : filteredWords.length === 0 ? (
                <Card variant="dark">
                    <p style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
                        {words.length === 0 ? 'No words saved yet. Start reading!' : 'No words match your filter.'}
                    </p>
                </Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    {filteredWords.map(word => (
                        <Card key={word.id} variant="dark">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
                                <div>
                                    <h3 style={{ fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.textPrimary }}>
                                        {word.originalWord}
                                    </h3>
                                    <p style={{ fontSize: theme.fontSize.md, color: theme.colors.accent, fontWeight: theme.fontWeight.medium }}>
                                        {word.translatedWord}
                                    </p>
                                </div>
                                <span style={{
                                    padding: '4px 8px',
                                    background: theme.colors.darkSecondary,
                                    borderRadius: theme.borderRadius.sm,
                                    fontSize: theme.fontSize.xs,
                                    color: theme.colors.textSecondary,
                                }}>
                                    {word.sourceLanguage} → {word.targetLanguage}
                                </span>
                            </div>
                            {word.context && (
                                <p style={{
                                    fontSize: theme.fontSize.sm,
                                    color: theme.colors.textSecondary,
                                    fontStyle: 'italic',
                                    marginBottom: theme.spacing.md,
                                    padding: theme.spacing.sm,
                                    background: theme.colors.darkSecondary,
                                    borderRadius: theme.borderRadius.sm,
                                }}>
                                    "{word.context}"
                                </p>
                            )}
                            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                                <Button size="sm" onClick={() => handleCreateFlashcard(word)}>
                                    Create Flashcard
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(word.id)}>
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
};

// Flashcards Page
const FlashcardsPage = ({ token, showToast }) => {
    const [mode, setMode] = useState('menu');
    const [flashcards, setFlashcards] = useState([]);
    const [allFlashcards, setAllFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [createData, setCreateData] = useState({ front: '', back: '' });
    const [loading, setLoading] = useState(false);
    const [reviewStartTime, setReviewStartTime] = useState(null);

    useEffect(() => { loadAllFlashcards(); }, []);

    const loadDueFlashcards = async () => {
        setLoading(true);
        const response = await fetch(`${API_URL}/flashcards/due`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();
        setFlashcards(data);
        setCurrentIndex(0);
        setFlipped(false);
        setLoading(false);
    };

    const loadAllFlashcards = async () => {
        const response = await fetch(`${API_URL}/flashcards`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();
        setAllFlashcards(data);
    };

    const handleReview = async (quality) => {
        const flashcard = flashcards[currentIndex];
        const responseTime = reviewStartTime ? Math.round((Date.now() - reviewStartTime) / 1000) : 5;
        await fetch(`${API_URL}/flashcards/review`, {
            method: 'POST',
            headers: api.headers(token),
            body: JSON.stringify({ flashcardId: flashcard.id, quality, responseTimeSeconds: responseTime })
        });
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setFlipped(false);
            setReviewStartTime(null);
        } else {
            await loadDueFlashcards();
            await loadAllFlashcards();
            if (flashcards.length <= 1) setMode('menu');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const response = await fetch(`${API_URL}/flashcards`, {
            method: 'POST',
            headers: api.headers(token),
            body: JSON.stringify(createData)
        });
        if (response.ok) {
            setCreateData({ front: '', back: '' });
            await loadAllFlashcards();
            showToast('Flashcard created!', 'success');
        } else {
            showToast('Failed to create flashcard', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this flashcard?')) {
            await fetch(`${API_URL}/flashcards/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            setAllFlashcards(allFlashcards.filter(f => f.id !== id));
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const dueCount = allFlashcards.filter(f => {
        if (!f.nextReviewDate) return true; // New cards without review date are due
        const reviewDate = f.nextReviewDate.split('T')[0]; // Handle both date and datetime formats
        return reviewDate <= today;
    }).length;

    // Menu
    if (mode === 'menu') {
        return (
            <>
                <Header title="Flashcards" subtitle="Learn with spaced repetition" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    <Card
                        variant="dark"
                        onClick={async () => { await loadDueFlashcards(); setMode('review'); }}
                        style={{ cursor: 'pointer', border: dueCount > 0 ? `1px solid ${theme.colors.accent}` : 'none' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: theme.borderRadius.full,
                                background: theme.colors.accent,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: theme.colors.textDark,
                                fontSize: theme.fontSize.xl,
                                fontWeight: theme.fontWeight.bold,
                            }}>
                                {dueCount}
                            </div>
                            <div>
                                <h3 style={{ fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.textPrimary }}>
                                    Review Due Cards
                                </h3>
                                <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
                                    {dueCount > 0 ? `${dueCount} cards waiting` : 'All caught up!'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card variant="dark" onClick={() => setMode('all')} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: theme.borderRadius.full,
                                background: theme.colors.darkSecondary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: theme.colors.textPrimary,
                                fontSize: theme.fontSize.xl,
                                fontWeight: theme.fontWeight.bold,
                            }}>
                                {allFlashcards.length}
                            </div>
                            <div>
                                <h3 style={{ fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.textPrimary }}>
                                    All Flashcards
                                </h3>
                                <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
                                    View and manage all cards
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card variant="dark" onClick={() => setMode('create')} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: theme.borderRadius.full,
                                background: theme.colors.success,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: theme.colors.textDark,
                                fontSize: theme.fontSize.xxl,
                                fontWeight: theme.fontWeight.bold,
                            }}>
                                +
                            </div>
                            <div>
                                <h3 style={{ fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.textPrimary }}>
                                    Create New
                                </h3>
                                <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
                                    Add a flashcard manually
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </>
        );
    }

    // Review
    if (mode === 'review') {
        if (loading) return <Card variant="dark"><p style={{ color: theme.colors.textSecondary }}>Loading...</p></Card>;
        if (flashcards.length === 0) {
            return (
                <>
                    <Header title="Review Complete!" subtitle="Great job!" />
                    <Card variant="dark">
                        <p style={{ color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg }}>
                            No flashcards due for review.
                        </p>
                        <Button fullWidth onClick={() => setMode('menu')}>Back to Menu</Button>
                    </Card>
                </>
            );
        }

        const currentCard = flashcards[currentIndex];
        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
                    <h2 style={{ fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.textPrimary }}>
                        Review
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setMode('menu')}>End</Button>
                </div>

                <div style={{
                    height: '4px',
                    background: theme.colors.darkCard,
                    borderRadius: '2px',
                    marginBottom: theme.spacing.xl,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        width: `${(currentIndex / flashcards.length) * 100}%`,
                        height: '100%',
                        background: theme.colors.accent,
                        transition: 'width 0.3s ease',
                    }} />
                </div>

                <Card
                    variant="dark"
                    onClick={() => { if (!flipped) { setFlipped(true); setReviewStartTime(Date.now()); } }}
                    style={{
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: !flipped ? 'pointer' : 'default',
                        marginBottom: theme.spacing.lg,
                        background: flipped ? theme.colors.darkSecondary : theme.colors.accent,
                    }}
                >
                    <p style={{
                        fontSize: theme.fontSize.xxl,
                        fontWeight: theme.fontWeight.bold,
                        color: flipped ? theme.colors.accent : theme.colors.textDark,
                        textAlign: 'center',
                    }}>
                        {flipped ? currentCard.back : currentCard.front}
                    </p>
                    {!flipped && (
                        <p style={{ color: theme.colors.textDark, opacity: 0.7, marginTop: theme.spacing.md, fontSize: theme.fontSize.sm }}>
                            Tap to reveal
                        </p>
                    )}
                </Card>

                {flipped && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: theme.spacing.sm }}>
                        {[
                            { quality: 0, label: 'Again', color: theme.colors.error },
                            { quality: 2, label: 'Hard', color: theme.colors.warning },
                            { quality: 3, label: 'Good', color: theme.colors.info },
                            { quality: 5, label: 'Easy', color: theme.colors.success },
                        ].map(btn => (
                            <button
                                key={btn.quality}
                                onClick={() => handleReview(btn.quality)}
                                style={{
                                    padding: theme.spacing.md,
                                    background: btn.color,
                                    border: 'none',
                                    borderRadius: theme.borderRadius.md,
                                    color: theme.colors.textDark,
                                    fontWeight: theme.fontWeight.semibold,
                                    cursor: 'pointer',
                                    fontSize: theme.fontSize.sm,
                                }}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                )}
            </>
        );
    }

    // All Flashcards
    if (mode === 'all') {
        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
                    <h2 style={{ fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.textPrimary }}>
                        All Flashcards
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setMode('menu')}>Back</Button>
                </div>

                {allFlashcards.length === 0 ? (
                    <Card variant="dark">
                        <p style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>No flashcards yet.</p>
                    </Card>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                        {allFlashcards.map(card => {
                            const isDue = !card.nextReviewDate || card.nextReviewDate.split('T')[0] <= today;
                            return (
                                <Card key={card.id} variant="dark" style={{ borderLeft: isDue ? `3px solid ${theme.colors.accent}` : 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
                                        <h4 style={{ fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.textPrimary }}>
                                            {card.front}
                                        </h4>
                                        {isDue && (
                                            <span style={{
                                                padding: '2px 8px',
                                                background: `${theme.colors.accent}20`,
                                                color: theme.colors.accent,
                                                borderRadius: theme.borderRadius.sm,
                                                fontSize: theme.fontSize.xs,
                                            }}>
                                                Due
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ color: theme.colors.accent, marginBottom: theme.spacing.sm }}>{card.back}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: theme.fontSize.xs, color: theme.colors.textSecondary }}>
                                            Next: {card.nextReviewDate}
                                        </span>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(card.id)}>Delete</Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </>
        );
    }

    // Create
    if (mode === 'create') {
        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
                    <h2 style={{ fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.textPrimary }}>
                        Create Flashcard
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setMode('menu')}>Back</Button>
                </div>

                <Card variant="dark">
                    <form onSubmit={handleCreate}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: theme.spacing.sm, color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
                                    Front (Question)
                                </label>
                                <textarea
                                    value={createData.front}
                                    onChange={(e) => setCreateData({ ...createData, front: e.target.value })}
                                    placeholder="Enter the question or word..."
                                    required
                                    style={{
                                        width: '100%',
                                        padding: theme.spacing.md,
                                        background: theme.colors.darkSecondary,
                                        border: `1px solid ${theme.colors.border}`,
                                        borderRadius: theme.borderRadius.md,
                                        color: theme.colors.textPrimary,
                                        fontSize: theme.fontSize.md,
                                        fontFamily: 'inherit',
                                        minHeight: '100px',
                                        resize: 'vertical',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: theme.spacing.sm, color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
                                    Back (Answer)
                                </label>
                                <textarea
                                    value={createData.back}
                                    onChange={(e) => setCreateData({ ...createData, back: e.target.value })}
                                    placeholder="Enter the answer or translation..."
                                    required
                                    style={{
                                        width: '100%',
                                        padding: theme.spacing.md,
                                        background: theme.colors.darkSecondary,
                                        border: `1px solid ${theme.colors.border}`,
                                        borderRadius: theme.borderRadius.md,
                                        color: theme.colors.textPrimary,
                                        fontSize: theme.fontSize.md,
                                        fontFamily: 'inherit',
                                        minHeight: '100px',
                                        resize: 'vertical',
                                    }}
                                />
                            </div>
                            <Button type="submit" fullWidth>Create Flashcard</Button>
                        </div>
                    </form>
                </Card>
            </>
        );
    }

    return null;
};

// Daily Challenge Page
const DailyChallengePage = ({ token, showToast }) => {
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadChallenge();
    }, []);

    const loadChallenge = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/daily-challenge`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setChallenge(data);
                if (data.isCompleted) {
                    setShowResults(true);
                }
            }
        } catch (error) {
            showToast('Failed to load challenge', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (wordId, answer) => {
        setSelectedAnswers({ ...selectedAnswers, [wordId]: answer });
    };

    const handleNextWord = () => {
        if (currentWordIndex < (challenge?.words?.length || 0) - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
        }
    };

    const handlePrevWord = () => {
        if (currentWordIndex > 0) {
            setCurrentWordIndex(currentWordIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (!challenge?.words) return;

        const answers = challenge.words.map(word => ({
            wordId: word.wordId,
            selectedAnswer: selectedAnswers[word.wordId] || ''
        }));

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/daily-challenge/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answers })
            });
            if (response.ok) {
                const result = await response.json();
                setChallenge(result);
                setShowResults(true);
                showToast(`+${result.xpEarned} XP earned!`, 'success');
            }
        } catch (error) {
            showToast('Failed to submit answers', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const allAnswered = challenge?.words?.every(w => selectedAnswers[w.wordId]);

    if (loading) {
        return (
            <>
                <Header title="Daily Challenge" subtitle="Loading..." />
                <Card variant="dark">
                    <p style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>Loading challenge...</p>
                </Card>
            </>
        );
    }

    // Stats header
    const StatsBar = () => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            padding: theme.spacing.md,
            background: theme.colors.darkSecondary,
            borderRadius: theme.borderRadius.lg,
            marginBottom: theme.spacing.lg,
        }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, color: theme.colors.accent }}>
                    {challenge?.totalChallengesCompleted || 0}
                </p>
                <p style={{ fontSize: theme.fontSize.xs, color: theme.colors.textSecondary }}>Challenges</p>
            </div>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, color: theme.colors.success }}>
                    {challenge?.totalWordsLearned || 0}
                </p>
                <p style={{ fontSize: theme.fontSize.xs, color: theme.colors.textSecondary }}>Words Learned</p>
            </div>
        </div>
    );

    // No words case
    if (!challenge?.words || challenge.words.length === 0) {
        return (
            <>
                <Header title="Daily Challenge" subtitle="Learn new words every day" />
                <StatsBar />
                <Card variant="dark">
                    <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
                        <p style={{ fontSize: theme.fontSize.xl, marginBottom: theme.spacing.md, color: theme.colors.textPrimary }}>
                            No words yet!
                        </p>
                        <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
                            Start reading books and saving words to unlock daily challenges.
                        </p>
                    </div>
                </Card>
            </>
        );
    }

    // Results view
    if (showResults) {
        const percentage = challenge.wordsShown > 0
            ? Math.round((challenge.wordsCorrect / challenge.wordsShown) * 100)
            : 0;

        return (
            <>
                <Header title="Challenge Complete!" subtitle={`${challenge.wordsCorrect}/${challenge.wordsShown} correct`} />
                <StatsBar />

                <Card variant="dark" style={{ marginBottom: theme.spacing.lg, textAlign: 'center' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: theme.borderRadius.full,
                        background: challenge.wordsCorrect === challenge.wordsShown ? theme.colors.success : theme.colors.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        marginBottom: theme.spacing.lg,
                    }}>
                        <span style={{ fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, color: theme.colors.textDark }}>
                            {percentage}%
                        </span>
                    </div>
                    <p style={{ fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
                        {challenge.wordsCorrect === challenge.wordsShown ? 'Perfect!' : 'Good job!'}
                    </p>
                    <p style={{ color: theme.colors.textSecondary }}>
                        Come back tomorrow for a new challenge!
                    </p>
                </Card>
            </>
        );
    }

    // Quiz view
    const currentWord = challenge.words[currentWordIndex];

    // Get exercise type label and icon
    const getExerciseTypeInfo = (type) => {
        switch (type) {
            case 'fill_blank': return { label: 'Fill in the Blank', icon: '___' };
            case 'reverse': return { label: 'Reverse Translation', icon: '↩' };
            case 'context_match': return { label: 'Find the Context', icon: '📖' };
            case 'translation':
            default: return { label: 'Translation', icon: '🔤' };
        }
    };

    const exerciseInfo = getExerciseTypeInfo(currentWord.exerciseType);

    return (
        <>
            <Header title="Daily Challenge" subtitle={`Exercise ${currentWordIndex + 1} of ${challenge.words.length}`} />
            <StatsBar />

            {/* Progress dots */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.lg,
            }}>
                {challenge.words.map((_, idx) => (
                    <div
                        key={idx}
                        onClick={() => setCurrentWordIndex(idx)}
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: selectedAnswers[challenge.words[idx].wordId]
                                ? theme.colors.success
                                : idx === currentWordIndex
                                    ? theme.colors.accent
                                    : theme.colors.darkCard,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    />
                ))}
            </div>

            {/* Exercise type badge */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: theme.spacing.md,
            }}>
                <span style={{
                    padding: '6px 12px',
                    background: theme.colors.accent + '20',
                    color: theme.colors.accent,
                    borderRadius: theme.borderRadius.full,
                    fontSize: theme.fontSize.sm,
                    fontWeight: theme.fontWeight.medium,
                }}>
                    {exerciseInfo.icon} {exerciseInfo.label}
                </span>
            </div>

            {/* Exercise card */}
            <Card variant="dark" style={{ marginBottom: theme.spacing.lg }}>
                <div style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
                    {/* Question */}
                    <p style={{
                        fontSize: theme.fontSize.md,
                        color: theme.colors.textSecondary,
                        marginBottom: theme.spacing.md,
                    }}>
                        {currentWord.question}
                    </p>

                    {/* Main content based on exercise type */}
                    {currentWord.exerciseType === 'fill_blank' && currentWord.contextWithBlank && (
                        <p style={{
                            fontSize: theme.fontSize.lg,
                            color: theme.colors.textPrimary,
                            padding: theme.spacing.md,
                            background: theme.colors.darkSecondary,
                            borderRadius: theme.borderRadius.md,
                            lineHeight: 1.6,
                        }}>
                            "{currentWord.contextWithBlank}"
                        </p>
                    )}

                    {currentWord.exerciseType === 'translation' && (
                        <p style={{
                            fontSize: theme.fontSize.xxl,
                            fontWeight: theme.fontWeight.bold,
                            color: theme.colors.textPrimary,
                        }}>
                            {currentWord.originalWord}
                        </p>
                    )}

                    {currentWord.exerciseType === 'reverse' && (
                        <p style={{
                            fontSize: theme.fontSize.xxl,
                            fontWeight: theme.fontWeight.bold,
                            color: theme.colors.accent,
                        }}>
                            {currentWord.correctTranslation}
                        </p>
                    )}

                    {currentWord.exerciseType === 'context_match' && (
                        <p style={{
                            fontSize: theme.fontSize.xl,
                            fontWeight: theme.fontWeight.bold,
                            color: theme.colors.textPrimary,
                        }}>
                            "{currentWord.originalWord}"
                        </p>
                    )}
                </div>

                <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, marginBottom: theme.spacing.md }}>
                    Select the correct answer:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                    {currentWord.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelectAnswer(currentWord.wordId, option)}
                            style={{
                                padding: theme.spacing.md,
                                background: selectedAnswers[currentWord.wordId] === option
                                    ? theme.colors.accent
                                    : theme.colors.darkSecondary,
                                border: `2px solid ${selectedAnswers[currentWord.wordId] === option
                                    ? theme.colors.accent
                                    : theme.colors.border}`,
                                borderRadius: theme.borderRadius.md,
                                color: selectedAnswers[currentWord.wordId] === option
                                    ? theme.colors.textDark
                                    : theme.colors.textPrimary,
                                fontSize: currentWord.exerciseType === 'context_match' ? theme.fontSize.sm : theme.fontSize.md,
                                fontWeight: theme.fontWeight.medium,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                lineHeight: 1.4,
                            }}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: theme.spacing.md }}>
                <Button
                    variant="secondary"
                    onClick={handlePrevWord}
                    disabled={currentWordIndex === 0}
                    style={{ flex: 1 }}
                >
                    Previous
                </Button>
                {currentWordIndex < challenge.words.length - 1 ? (
                    <Button
                        onClick={handleNextWord}
                        style={{ flex: 1 }}
                    >
                        Next
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={!allAnswered || submitting}
                        style={{ flex: 1 }}
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </Button>
                )}
            </div>
        </>
    );
};

// Admin Page
const AdminPage = ({ token, showToast }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);
    const [createAdminData, setCreateAdminData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                showToast('Failed to load users', 'error');
            }
        } catch (error) {
            showToast('Error loading users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserEnabled = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-enabled`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                loadUsers();
                showToast('User status updated', 'success');
            }
        } catch (error) {
            showToast('Error updating user', 'error');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const response = await fetch(`${API_URL}/admin/users/create-admin`, {
                method: 'POST',
                headers: api.headers(token),
                body: JSON.stringify(createAdminData)
            });
            if (response.ok) {
                setShowCreateAdmin(false);
                setCreateAdminData({ username: '', email: '', password: '', firstName: '', lastName: '' });
                loadUsers();
                showToast('Admin user created successfully!', 'success');
            } else {
                const error = await response.json();
                showToast('Failed to create admin: ' + (error.message || 'Unknown error'), 'error');
            }
        } catch (error) {
            showToast('Error creating admin: ' + error.message, 'error');
        } finally {
            setCreating(false);
        }
    };

    // User detail view
    if (selectedUser) {
        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
                    <h2 style={{ fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.textPrimary }}>
                        User Details
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>Back</Button>
                </div>

                <Card variant="dark" style={{ marginBottom: theme.spacing.lg }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
                        <Avatar text={selectedUser.username} size="xl" />
                        <div>
                            <h3 style={{ fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.textPrimary }}>
                                {selectedUser.firstName} {selectedUser.lastName}
                            </h3>
                            <p style={{ color: theme.colors.textSecondary }}>@{selectedUser.username}</p>
                            <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>{selectedUser.email}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '4px 12px',
                            background: selectedUser.role === 'ADMIN' ? theme.colors.accent : theme.colors.darkSecondary,
                            color: selectedUser.role === 'ADMIN' ? theme.colors.textDark : theme.colors.textSecondary,
                            borderRadius: theme.borderRadius.full,
                            fontSize: theme.fontSize.sm,
                        }}>
                            {selectedUser.role}
                        </span>
                        <span style={{
                            padding: '4px 12px',
                            background: selectedUser.isEnabled ? theme.colors.success : theme.colors.error,
                            color: theme.colors.textDark,
                            borderRadius: theme.borderRadius.full,
                            fontSize: theme.fontSize.sm,
                        }}>
                            {selectedUser.isEnabled ? 'Active' : 'Disabled'}
                        </span>
                        {selectedUser.isActive && (
                            <span style={{
                                padding: '4px 12px',
                                background: theme.colors.info,
                                color: theme.colors.textDark,
                                borderRadius: theme.borderRadius.full,
                                fontSize: theme.fontSize.sm,
                            }}>
                                Learning Active
                            </span>
                        )}
                    </div>
                </Card>

                {/* Learning Stats */}
                <h3 style={{ fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.textPrimary, marginBottom: theme.spacing.md }}>
                    Learning Statistics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
                    <Card variant="dark" padding="md">
                        <p style={{ fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, color: theme.colors.accent }}>{selectedUser.totalBooks}</p>
                        <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>Books</p>
                    </Card>
                    <Card variant="dark" padding="md">
                        <p style={{ fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, color: theme.colors.accent }}>{selectedUser.totalWords}</p>
                        <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>Words Saved</p>
                    </Card>
                    <Card variant="dark" padding="md">
                        <p style={{ fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, color: theme.colors.accent }}>{selectedUser.totalFlashcards}</p>
                        <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>Flashcards</p>
                    </Card>
                    <Card variant="dark" padding="md">
                        <p style={{ fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, color: theme.colors.accent }}>{selectedUser.flashcardsDueToday}</p>
                        <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>Due Today</p>
                    </Card>
                </div>

                {/* Activity Stats */}
                <h3 style={{ fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.textPrimary, marginBottom: theme.spacing.md }}>
                    Activity
                </h3>
                <Card variant="dark" style={{ marginBottom: theme.spacing.lg }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: theme.spacing.lg }}>
                        <div>
                            <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>Reviews Today</p>
                            <p style={{ fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.textPrimary }}>{selectedUser.totalReviewsToday}</p>
                        </div>
                        <div>
                            <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>Total Reviews</p>
                            <p style={{ fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.textPrimary }}>{selectedUser.totalReviewsAllTime}</p>
                        </div>
                        <div>
                            <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>Days Active (30d)</p>
                            <p style={{ fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.textPrimary }}>{selectedUser.daysActive}</p>
                        </div>
                        <div>
                            <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>Avg. Ease Factor</p>
                            <p style={{ fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.textPrimary }}>{selectedUser.averageEaseFactor || '-'}</p>
                        </div>
                    </div>
                </Card>

                {/* Dates */}
                <Card variant="dark" style={{ marginBottom: theme.spacing.lg }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                        <span style={{ color: theme.colors.textSecondary }}>Registered</span>
                        <span style={{ color: theme.colors.textPrimary }}>{formatDate(selectedUser.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: theme.colors.textSecondary }}>Last Activity</span>
                        <span style={{ color: theme.colors.textPrimary }}>{formatDate(selectedUser.lastActivity)}</span>
                    </div>
                </Card>

                {/* Actions */}
                <Button
                    variant={selectedUser.isEnabled ? 'danger' : 'primary'}
                    fullWidth
                    onClick={() => {
                        toggleUserEnabled(selectedUser.id);
                        setSelectedUser({ ...selectedUser, isEnabled: !selectedUser.isEnabled });
                    }}
                >
                    {selectedUser.isEnabled ? 'Disable User' : 'Enable User'}
                </Button>
            </>
        );
    }

    // Users list
    return (
        <>
            <Header title="Admin Panel" subtitle={`${users.length} users registered`} />

            <Button
                fullWidth
                onClick={() => setShowCreateAdmin(!showCreateAdmin)}
                style={{ marginBottom: theme.spacing.lg }}
            >
                {showCreateAdmin ? 'Cancel' : '+ Create Admin'}
            </Button>

            {showCreateAdmin && (
                <Card variant="dark" style={{ marginBottom: theme.spacing.lg }}>
                    <h3 style={{
                        fontSize: theme.fontSize.lg,
                        fontWeight: theme.fontWeight.semibold,
                        color: theme.colors.textPrimary,
                        marginBottom: theme.spacing.md,
                    }}>
                        Create New Admin
                    </h3>
                    <form onSubmit={handleCreateAdmin}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                            <Input
                                placeholder="Username"
                                value={createAdminData.username}
                                onChange={(e) => setCreateAdminData({ ...createAdminData, username: e.target.value })}
                                required
                            />
                            <Input
                                type="email"
                                placeholder="Email"
                                value={createAdminData.email}
                                onChange={(e) => setCreateAdminData({ ...createAdminData, email: e.target.value })}
                                required
                            />
                            <div style={{ display: 'flex', gap: theme.spacing.md }}>
                                <Input
                                    placeholder="First Name"
                                    value={createAdminData.firstName}
                                    onChange={(e) => setCreateAdminData({ ...createAdminData, firstName: e.target.value })}
                                />
                                <Input
                                    placeholder="Last Name"
                                    value={createAdminData.lastName}
                                    onChange={(e) => setCreateAdminData({ ...createAdminData, lastName: e.target.value })}
                                />
                            </div>
                            <Input
                                type="password"
                                placeholder="Password (min 6 characters)"
                                value={createAdminData.password}
                                onChange={(e) => setCreateAdminData({ ...createAdminData, password: e.target.value })}
                                required
                            />
                            <Button type="submit" disabled={creating}>
                                {creating ? 'Creating...' : 'Create Admin'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {loading ? (
                <Card variant="dark">
                    <p style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>Loading users...</p>
                </Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    {users.map(user => (
                        <Card
                            key={user.id}
                            variant="dark"
                            onClick={() => setSelectedUser(user)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                                <Avatar text={user.username} size="md" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                                        <h3 style={{
                                            fontSize: theme.fontSize.md,
                                            fontWeight: theme.fontWeight.semibold,
                                            color: theme.colors.textPrimary,
                                        }}>
                                            {user.firstName || user.username}
                                        </h3>
                                        {user.role === 'ADMIN' && (
                                            <span style={{
                                                padding: '2px 6px',
                                                background: theme.colors.accent,
                                                color: theme.colors.textDark,
                                                borderRadius: theme.borderRadius.sm,
                                                fontSize: theme.fontSize.xs,
                                            }}>
                                                Admin
                                            </span>
                                        )}
                                        {!user.isEnabled && (
                                            <span style={{
                                                padding: '2px 6px',
                                                background: theme.colors.error,
                                                color: theme.colors.textDark,
                                                borderRadius: theme.borderRadius.sm,
                                                fontSize: theme.fontSize.xs,
                                            }}>
                                                Disabled
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm }}>
                                        @{user.username}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: '4px' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            background: theme.colors.darkSecondary,
                                            borderRadius: theme.borderRadius.sm,
                                            fontSize: theme.fontSize.xs,
                                            color: theme.colors.textSecondary,
                                        }}>
                                            {user.totalBooks} books
                                        </span>
                                        <span style={{
                                            padding: '2px 8px',
                                            background: theme.colors.darkSecondary,
                                            borderRadius: theme.borderRadius.sm,
                                            fontSize: theme.fontSize.xs,
                                            color: theme.colors.textSecondary,
                                        }}>
                                            {user.totalFlashcards} cards
                                        </span>
                                    </div>
                                    <p style={{
                                        fontSize: theme.fontSize.xs,
                                        color: user.isActive ? theme.colors.success : theme.colors.textMuted,
                                    }}>
                                        {user.isActive ? 'Active learner' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
};

export default App;
