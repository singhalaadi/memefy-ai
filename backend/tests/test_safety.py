"""Tests for toxicity and sentiment classification."""

import pytest
from unittest.mock import MagicMock, patch
import sys
from pathlib import Path

backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))


class TestSafetyCheck:
    """Test suite for check_safety function."""

    @patch("main.tfidf")
    @patch("main.clf")
    def test_safe_text(self, mock_clf, mock_tfidf):
        """Safe text should return (True, low_prob)."""
        from main import check_safety

        mock_tfidf.transform.return_value = [[0.2]]
        mock_clf.predict_proba.return_value = [[0.9, 0.1]]  # Prob = 0.1 (safe)

        safe, prob = check_safety("I love this movie!")
        assert safe == True
        assert 0 <= prob <= 1
        assert prob == 0.1

    @patch("main.tfidf")
    @patch("main.clf")
    def test_toxic_text(self, mock_clf, mock_tfidf):
        """Toxic text should return (False, high_prob)."""
        from main import check_safety

        mock_tfidf.transform.return_value = [[0.8]]
        mock_clf.predict_proba.return_value = [[0.2, 0.8]]  # Prob = 0.8 (toxic)

        safe, prob = check_safety("I hate everything")
        assert safe == False
        assert prob == 0.8

    @patch("main.tfidf")
    @patch("main.clf")
    def test_threshold_boundary(self, mock_clf, mock_tfidf):
        """Test probability at threshold boundary (0.5)."""
        from main import check_safety

        mock_tfidf.transform.return_value = [[0.5]]
        mock_clf.predict_proba.return_value = [[0.5, 0.5]]  # Prob = 0.5 (at threshold)

        safe, prob = check_safety("ambiguous text", threshold=0.5)
        assert safe == False  # prob < threshold is False
        assert prob == 0.5

    @patch("main.tfidf")
    @patch("main.clf")
    def test_empty_text(self, mock_clf, mock_tfidf):
        """Empty text should be handled gracefully."""
        from main import check_safety

        mock_tfidf.transform.return_value = [[0.0]]
        mock_clf.predict_proba.return_value = [[1.0, 0.0]]

        safe, prob = check_safety("")
        assert safe == True
        assert prob == 0.0


class TestCalibrateToxicity:
    """Test suite for calibrate_toxicity function."""

    def test_toxic_markers_detected(self):
        """Text with toxic markers should maintain high prob."""
        from main import calibrate_toxicity

        result = calibrate_toxicity("I hate this stupid thing", 0.7)
        assert result == 0.7

    def test_benign_markers_reduce_prob(self):
        """Text with benign markers should be reduced."""
        from main import calibrate_toxicity

        result = calibrate_toxicity("naruto episode review", 0.4)
        assert result <= 0.12

    def test_short_question_reduced_prob(self):
        """Short questions should have reduced toxicity."""
        from main import calibrate_toxicity

        result = calibrate_toxicity("Why is this?", 0.3)
        assert result <= 0.2

    def test_none_text(self):
        """None text should not crash."""
        from main import calibrate_toxicity

        result = calibrate_toxicity(None, 0.5)
        assert result == 0.5


class TestSentimentLabel:
    """Test suite for sentiment_label function."""

    def test_positive_label(self):
        """Probability < 0.15 should return 'Positive / Safe'."""
        from main import sentiment_label

        assert sentiment_label(0.1) == "Positive / Safe"
        assert sentiment_label(0.0) == "Positive / Safe"

    def test_neutral_label(self):
        """Probability 0.15-0.35 should return 'Neutral / Sarcastic'."""
        from main import sentiment_label

        assert sentiment_label(0.25) == "Neutral / Sarcastic"
        assert sentiment_label(0.15) == "Neutral / Sarcastic"

    def test_risky_label(self):
        """Probability >= 0.35 should return 'Risky / Negative'."""
        from main import sentiment_label

        assert sentiment_label(0.5) == "Risky / Negative"
        assert sentiment_label(0.9) == "Risky / Negative"


class TestNormalizeCaption:
    """Test suite for normalize_caption function."""

    def test_remove_prefix(self):
        """Should remove caption prefixes."""
        from main import normalize_caption

        assert normalize_caption("Caption: Hello world") == "Hello world"
        assert normalize_caption("Meme: Not funny") == "Not funny"

    def test_remove_quotes(self):
        """Should remove quotes from text."""
        from main import normalize_caption

        assert normalize_caption('"Hello world"') == "Hello world"
        assert normalize_caption("'Not funny'") == "Not funny"

    def test_remove_choose_phrase(self):
        """Should remove 'choose between' phrase."""
        from main import normalize_caption

        result = normalize_caption("Choose between A and B")
        assert "choose between" not in result.lower()


@pytest.mark.unit
class TestGeminiPrompt:
    """Test suite for gemini_prompt function."""

    def test_single_box_prompt(self):
        """Single box prompt should have single sentence guideline."""
        from main import gemini_prompt

        prompt = gemini_prompt("My idea", box_count=1)
        assert "single short" in prompt.lower()
        assert "My idea" in prompt

    def test_two_box_prompt(self):
        """Two box prompt should have BOX1 and BOX2 format."""
        from main import gemini_prompt

        prompt = gemini_prompt("My idea", box_count=2)
        assert "BOX1:" in prompt
        assert "BOX2:" in prompt
        assert "|" in prompt

    def test_multi_box_prompt(self):
        """Multi-box prompt should handle more than 2 boxes."""
        from main import gemini_prompt

        prompt = gemini_prompt("My idea", box_count=3)
        assert "BOX1:" in prompt
        assert "box_count=3" not in prompt  # Should use {box_count}
