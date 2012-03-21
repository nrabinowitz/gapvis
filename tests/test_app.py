from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
import unittest, time, re

class TestIndex(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        # self.driver = webdriver.Remote("http://localhost:4444/wd/hub", webdriver.DesiredCapabilities.HTMLUNIT)
        self.driver.implicitly_wait(10)
        self.base_url = "http://localhost:8080/"
        self.verificationErrors = []
    
    def test_index(self):
        driver = self.driver
        driver.get(self.base_url + "/index.html")
        self.assertEqual("GapVis: Visual Interface for Reading Ancient Texts", driver.title,
            msg="Couldn't load application")
        self.assertEqual("Overview", driver.find_element_by_css_selector("h2").text,
            msg="Not on index page")
        self.assertTrue(self.is_element_present(By.XPATH, "//div[@id='book-list']/p"),
            msg="Couldn't find any books")
        self.assertTrue(self.is_element_present(By.XPATH, "//div[@id='book-list']/p[10]"),
            msg="Found fewer than 10 books")
        first_title = driver.find_element_by_xpath("//div[@id='book-list']/p/span").text
        # go to book page
        driver.find_element_by_xpath("//div[@id='book-list']/p/span").click()
        self.assertEqual(first_title, driver.find_element_by_css_selector("h2.book-title").text,
            msg="Book Summary title doesn't match index title")

    
    def test_book_summary(self):
        driver = self.driver
        driver.get(self.base_url + "/index.html#book/2")
        self.assertEqual("The Works of Cornelius Tacitus: The History", driver.find_element_by_css_selector("h2.book-title").text,
            msg="Book title missing or incorrect")
        self.assertEqual("Roma", driver.find_element_by_xpath("//div[@id='book-summary-text-view']/p/span[1]").text,
            msg="Top frequency place incorrect")
        self.assertTrue(self.is_element_present(By.CSS_SELECTOR, "#place-freq-bars-view > svg"),
            msg="Frequency bars SVG not found")
        self.assertTrue(self.is_element_present(By.CSS_SELECTOR, "label.ui-button.ui-state-active > span.ui-button-text"),
            msg='Book Summary button not active')
        self.assertRegexpMatches(driver.find_element_by_css_selector("a.permalink").get_attribute("href"), r"index\.html#book/2\?pageview=text$",
            msg="permalink not set correctly")

    
    def is_element_present(self, how, what):
        try: self.driver.find_element(by=how, value=what)
        except NoSuchElementException, e: return False
        return True
    
    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
