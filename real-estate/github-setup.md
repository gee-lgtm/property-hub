# GitHub Integration Commands

## After creating your GitHub repository, run these commands:

```bash
# Add GitHub as remote origin (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/property-hub-real-estate.git

# Or if you prefer SSH (requires SSH key setup):
# git remote add origin git@github.com:USERNAME/property-hub-real-estate.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

## Verify the setup:
```bash
# Check remote configuration
git remote -v

# View your commit on GitHub
git log --oneline -1
```

## Alternative: If you want to use GitHub CLI later:
```bash
# Authenticate with GitHub CLI
gh auth login

# Create repository directly from CLI
gh repo create property-hub-real-estate --public --push --source=.
```

## Repository Features to Enable:
After pushing to GitHub, consider enabling:

1. **GitHub Pages** for free hosting
2. **Dependabot** for dependency updates  
3. **Code scanning** for security
4. **Actions** for CI/CD deployment

## Next Steps:
1. Create the GitHub repository at github.com
2. Run the git remote add command with your username
3. Push the code with git push -u origin main
4. Your PropertyHub app will be live on GitHub!