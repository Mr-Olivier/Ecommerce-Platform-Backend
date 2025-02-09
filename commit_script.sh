#!/bin/bash

# Function to generate conventional commit message
generate_commit_message() {
    local file="$1"
    local type=""
    local message=""

    # Determine commit type based on file path
    case "$file" in
        prisma/schema.prisma)
            type="feat(db)"
            message="update Prisma database schema"
            ;;
        combined.log|error.log)
            type="chore(logs)"
            message="update log files"
            ;;
        src/controllers/auth.controller.ts)
            type="feat(api)"
            message="update authentication controller"
            ;;
        src/docs/components/responses.json)
            type="docs"
            message="update API response documentation"
            ;;
        src/docs/components/schemas.json)
            type="docs"
            message="update API schemas documentation"
            ;;
        src/docs/paths/auth.json)
            type="docs"
            message="update authentication paths documentation"
            ;;
        src/docs/swagger.ts)
            type="docs"
            message="update Swagger documentation configuration"
            ;;
        src/middlewares/validate.middleware.ts)
            type="feat(middleware)"
            message="update validation middleware"
            ;;
        src/routes/auth.routes.ts)
            type="feat(api)"
            message="update authentication routes"
            ;;
        src/services/auth.service.ts)
            type="feat(service)"
            message="update authentication service"
            ;;
        src/types/auth.types.ts)
            type="feat(types)"
            message="update authentication types"
            ;;
        src/validations/auth.validation.ts)
            type="feat(validation)"
            message="update authentication validation"
            ;;
        commit_script.sh)
            type="chore(ci)"
            message="update commit automation script"
            ;;
        dist/)
            type="build"
            message="update build output directory"
            ;;
        prisma/migrations/)
            type="chore(db)"
            message="add new database migrations"
            ;;
        *)
            type="chore"
            message="update ${file##*/}"
            ;;
    esac

    echo "${type}: ${message}"
}

# Function to check if git repository
check_git_repo() {
    if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        echo "Error: Not a git repository. Please initialize git first."
        exit 1
    fi
}

# Function to commit and push changes
commit_and_push_changes() {
    check_git_repo

    # Modified files
    modified_files=(
        "combined.log"
        "error.log"
        "prisma/schema.prisma"
        "src/controllers/auth.controller.ts"
        "src/docs/components/responses.json"
        "src/docs/components/schemas.json"
        "src/docs/paths/auth.json"
        "src/docs/swagger.ts"
        "src/middlewares/validate.middleware.ts"
        "src/routes/auth.routes.ts"
        "src/services/auth.service.ts"
        "src/types/auth.types.ts"
        "src/validations/auth.validation.ts"
    )

    # Untracked files
    untracked_files=(
        "commit_script.sh"
        "dist/"
        "prisma/migrations/"
    )

    # Process modified files
    for file in "${modified_files[@]}"; do
        if [ -f "$file" ] || [ -d "$file" ]; then
            commit_message=$(generate_commit_message "$file")
            git add "$file"
            git commit -m "$commit_message"
            echo "Committed modified file: $file with message - $commit_message"
        fi
    done

    # Process untracked files
    for file in "${untracked_files[@]}"; do
        if [ -f "$file" ] || [ -d "$file" ]; then
            commit_message=$(generate_commit_message "$file")
            git add "$file"
            git commit -m "$commit_message"
            echo "Committed new file: $file with message - $commit_message"
        else
            echo "Warning: Untracked file $file does not exist"
        fi
    done

    # Push all changes
    git push origin main
    echo "All changes have been committed and pushed successfully!"
}

# Run the function
commit_and_push_changes