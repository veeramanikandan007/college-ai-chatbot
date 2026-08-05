# A simple slang and Tanglish dictionary for CollegeMate AI

SLANG_DICTIONARY = {
    "epo": "when",
    "eppa": "when",
    "enna": "what",
    "epdi": "how",
    "eppadi": "how",
    "yaru": "who",
    "yaaru": "who",
    "yar": "who",
    "iruka": "is there",
    "sollu": "tell me",
    "solunga": "tell me",
    "sollunga": "tell me",
    "venum": "want",
    "varum": "will come",
    "evlo": "how much",
    "evalavu": "how much",
    "panradhu": "to do",
    "panrathu": "to do",
    "panni": "doing",
    "pannunga": "do",
    "iruku": "is there",
    "pls": "please",
    "plz": "please",
    "bro": "friend",
    "machan": "friend",
    "machi": "friend",
    "anna": "brother",
    "akka": "sister",
    "dei": "friend",
    "da": "friend",
    "urgent": "urgent",
    "ah": "",
    "la": "in",
    "ku": "to"
}

def normalize_slang(text: str) -> str:
    """
    Replaces Tanglish and Gen Z slang with standard English equivalents.
    Useful for Intent detection and RAG querying.
    """
    words = text.lower().split()
    normalized_words = []
    
    for word in words:
        # Strip simple punctuation from the end of the word for dictionary matching
        clean_word = word.strip("?,.!")
        if clean_word in SLANG_DICTIONARY:
            # Add back the punctuation if it existed
            punctuation = word[len(clean_word):]
            replacement = SLANG_DICTIONARY[clean_word]
            if replacement: # skip empty strings like "ah"
                normalized_words.append(replacement + punctuation)
        else:
            normalized_words.append(word)
            
    return " ".join(normalized_words)
