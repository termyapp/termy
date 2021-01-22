use indoc::indoc;

const SHORTCUTS: &str = indoc! {"
<br />

## Shortcuts

<br />

### Cell

New: <kbd>Cmd + N</kbd>

Remove: <kbd>Cmd + W</kbd>

<br />

### Move between cells

Down: <kbd>Cmd + J</kbd>

Up: <kbd>Cmd + K</kbd>

<br />

### Focus in-cell

Output: <kbd>Tab</kbd>

Prompt: <kbd>Shift + Tab</kbd>
"};

pub fn shortcuts() -> String {
    SHORTCUTS.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn returns_shortcuts() {
        assert_eq!(shortcuts(), SHORTCUTS.to_string());
    }
}
