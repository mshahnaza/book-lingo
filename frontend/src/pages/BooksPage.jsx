import React, { useState, useEffect } from 'react';
import { API_URL } from '../services/api';
import { styles } from '../styles';

const BooksPage = ({ token, onOpenBook }) => {
    const [books, setBooks] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadData, setUploadData] = useState({
        title: '',
        author: '',
        language: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = () => {
        setLoading(true);
        fetch(`${API_URL}/books`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setBooks(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
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
            } else {
                const error = await response.json();
                alert('Upload failed: ' + (error.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Upload failed: ' + error.message);
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
            } catch (error) {
                alert('Delete failed: ' + error.message);
            }
        }
    };

    return (
        <>
            <div style={styles.pageHeader}>
                <div style={styles.headerFlex}>
                    <div>
                        <h1 style={styles.pageTitle}>My Books</h1>
                        <p style={styles.pageSubtitle}>Click on a book to start reading</p>
                    </div>
                    <button style={styles.button} onClick={() => setShowUpload(!showUpload)}>
                        {showUpload ? 'Cancel' : '+ Upload Book'}
                    </button>
                </div>
            </div>

            {showUpload && (
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Upload New Book</h2>
                    <form onSubmit={handleUpload}>
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Book Title"
                            value={uploadData.title}
                            onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                            required
                        />
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Author"
                            value={uploadData.author}
                            onChange={(e) => setUploadData({...uploadData, author: e.target.value})}
                            required
                        />
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Language (e.g., en, ru, es)"
                            value={uploadData.language}
                            onChange={(e) => setUploadData({...uploadData, language: e.target.value})}
                            required
                        />
                        <div style={styles.fileInputWrapper}>
                            <input
                                id="book-file-input"
                                type="file"
                                accept=".pdf,.txt"
                                onChange={(e) => setFile(e.target.files[0])}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('book-file-input').click()}
                                style={styles.fileSelectButton}
                            >
                                {file ? file.name : 'Choose File (.pdf or .txt)'}
                            </button>
                        </div>
                        <button type="submit" style={styles.button} disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={styles.card}>Loading books...</div>
            ) : books.length === 0 ? (
                <div style={styles.card}>
                    <p style={styles.emptyState}>No books yet. Upload your first book to get started!</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {books.map(book => (
                        <div
                            key={book.id}
                            style={styles.bookItem}
                            onClick={() => onOpenBook(book)}
                        >
                            <div style={styles.bookCover}>
                                <span style={styles.bookCoverText}>{book.title.charAt(0)}</span>
                            </div>
                            <h3 style={styles.bookTitle}>{book.title}</h3>
                            <p style={styles.bookAuthor}>by {book.author}</p>
                            <div style={styles.badgeContainer}>
                                <span style={styles.badge}>{book.language}</span>
                                <span style={styles.badge}>{book.totalPages} pages</span>
                            </div>
                            <p style={styles.bookDate}>
                                Uploaded: {new Date(book.uploadedAt).toLocaleDateString()}
                            </p>
                            <button
                                onClick={(e) => handleDelete(book.id, e)}
                                style={{...styles.button, ...styles.deleteButton}}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default BooksPage;
