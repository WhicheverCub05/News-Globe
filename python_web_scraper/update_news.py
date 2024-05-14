from news_scraper import *
from git import Repo
import subprocess
import time
import sys


# news scraper script
news_scraper_path = "python_web_scraper/news_scraper.py"

# connect to git repo
git_repo_path = "/workspaces/News-Globe/.git"
news_update_commit_message = "updating news articles"

# ssh params
default_user = "u116096421"
default_host = "access1002706687.webspace-data.io"
default_filepath = "globe"

news_scraped = False
git_pushed = False
update_pushed = False


def run_python_file(filename):
    global news_scraped
    try:
        with open(filename) as file:
            exec(file.read())
            news_scraped = True
    except Exception as e:
        print('Error while running script: ', e)


def git_push(commit_message):
    global git_pushed
    try:
        repo = Repo(git_repo_path)
        repo.git.add(update=True)
        repo.index.commit(commit_message)
        origin = repo.remote(name='origin')
        origin.push()
        git_pushed = True
    except Exception as e:
        print('Error while pushing to git: ', e)


def ssh_push(user, host, filepath):
    global update_pushed
    # f"cd {filepath}", "git pull"
    commands = [f"ssh {user}@{host}", "yes", f"cd {filepath}", "git pull"]
    try:
        # ,stdout=subprocess.PIPE, stderr=subprocess.PIPE
        ssh_terminal = subprocess.Popen(commands, shell=True)
        stdout, stderr = ssh_terminal.communicate()

        print(stdout)
        print(stderr)
        update_pushed = True

    except Exception as e:
        print(f"Error connecting to {host}:", e)


def update_page_push():
    commit_message = input("commit message: ")
    print("Pushing to git repo ", git_repo_path,
          " with message: ", commit_message)
    git_push(commit_message)

    if git_pushed:
        print("updating webpage")
        ssh_push(default_user, default_host, default_filepath)
    if update_pushed:
        print("update complete")
    else:
        print(
            f"something went wrong - git_pushed: {git_pushed}, update_pushed {update_pushed}")


def update_news_push():
    print("Running ", news_scraper_path)
    run_python_file(news_scraper_path)
    print("\n")
    if news_scraped:
        print("Pushing to git repo ", git_repo_path,
              " with message: ", news_update_commit_message)
        git_push(news_update_commit_message)

    if git_pushed:
        print("updating webpage")
        ssh_push(default_user, default_host, default_filepath)

    if update_pushed:
        print("update complete")
    else:
        print(
            f"\nsomething went wrong:\nnews scraped: {news_scraped}, git pushed: {git_pushed}, update pushed ssh: {update_pushed}")


if __name__ == "__main__":
    done = False

    while not done:

        print("so what can I get for ya?\n",
              "1: update the news + push\n",
              "2: update the page + push\n",
              "3: only update news\n",
              "4: only push to web\n",
              "5: exit\n",
              "9: fly\n")

        user_input = input("choice: ")

        if not user_input:
            pass
        else:
            try:
                user_input = int(user_input)
            except:
                pass

        match user_input:
            case 1:
                print("updating the news and pushing")
                update_news_push()
            case 2:
                print("updating the page and pushing")
                update_page_push()
            case 3:
                print("updating the news")
                run_python_file(news_scraper_path)
            case 4:
                print("pushing to web")
                commit_message = input("commit message: ")
                git_push(commit_message)
                ssh_push(default_user, default_host, default_filepath)
            case 5:
                print("exiting")
                time.sleep(3)
                sys.exit()
            case 9:
                print("kek")
                subprocess.Popen(["curl ascii.live/parrot"], shell=True)
            case _:
                print("try another input")

        news_scraped = False
        git_pushed = False
        update_pushed = False
