"""Tests for scalable-lore-expert core module."""

from scalable_lore_expert.core import main


def test_main(capsys):
    """Test main entry point."""
    main()
    captured = capsys.readouterr()
    assert "scalable-lore-expert" in captured.out
