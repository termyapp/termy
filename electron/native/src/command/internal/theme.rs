use crate::cell::Action;
use indoc::formatdoc;

pub fn theme(args: Vec<String>) -> (String, Option<Action>) {
    if let Some(theme) = args.into_iter().next() {
        (
            formatdoc! {"<Card>Changed theme to <Path>{theme}</Path></Card>", theme = theme},
            Some(vec![(String::from("theme"), theme)]),
        )
    } else {
        (String::from("<Card>Invalid theme provided</Card>"), None)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn invalid() {
        assert_eq!(
            theme(vec![]),
            (String::from("<Card>Invalid theme</Card>"), None)
        );
    }

    #[test]
    fn valid() {
        assert_eq!(
            theme(vec![String::from("dark")]),
            (
                String::from("<Card>Changed theme to <Path>dark</Path></Card>"),
                Some(vec![(String::from("theme"), String::from("dark"))])
            )
        );
    }
}
