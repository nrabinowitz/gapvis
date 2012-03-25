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
    
    def test_click_through(self):
        driver = self.driver
        driver.get(self.base_url + "/index.html")
        # on index page
        self.assertEqual("GapVis: Visual Interface for Reading Ancient Texts", driver.title,
            msg="Couldn't load application")
        self.assertEqual("Overview", driver.find_element_by_css_selector("h2").text,
            msg="Not on index page")
        self.assertTrue(self.is_element_present(By.XPATH, "//div[@id='book-list']/p"),
            msg="Couldn't find any books")
        self.assertTrue(self.is_element_present(By.XPATH, "//div[@id='book-list']/p[10]"),
            msg="Found fewer than 10 books")
        first_title = driver.find_element_by_xpath("//div[@id='book-list']/p/span").text
        self.assertTrue(len(first_title) > 5,
            msg="Title of first book is missing or too short")
        # go to book page
        driver.find_element_by_xpath("//div[@id='book-list']/p/span").click()
        self.assertEqual(first_title, driver.find_element_by_css_selector("h2.book-title").text,
            msg="Book Summary title doesn't match index title")
        self.assertTrue(self.is_element_present(By.CSS_SELECTOR, "#place-freq-bars-view > svg"),
            msg="Frequency bars SVG not found")
        top_freq_place = driver.find_element_by_css_selector("#book-summary-text-view span.place").text
        self.assertNotEqual('', top_freq_place,
            msg="Top-frequency place is missing")
        self.assertEqual(top_freq_place, driver.find_element_by_css_selector("#place-freq-bars-view > svg text").text,
            msg="Top frequency place in paragraph doesn't match top frequency place in viz")
        self.assertTrue(self.is_element_present(By.CSS_SELECTOR, "label.ui-button.ui-state-active > span.ui-button-text"),
            msg='Book Summary button not active')
        self.assertRegexpMatches(driver.find_element_by_css_selector("a.permalink").get_attribute("href"), r"index\.html#book/\d+\?pageview=text$",
            msg="permalink not set correctly")
        # go to reading page
        driver.find_element_by_css_selector("button.goto-reading").click()
        self.assertEqual(first_title, driver.find_element_by_css_selector("h2.book-title.on").text,
            msg="Book Reading title doesn't match index title")
        self.assertNotEqual("", driver.find_element_by_css_selector("#page-view div.text").text,
            msg="Page text not displayed")
        first_place = driver.find_element_by_id("label-tl-0-0-e1").text
        self.assertNotEqual('', first_place,
            msg="First timeline place is missing")
        driver.find_element_by_id("label-tl-0-0-e1").click()
        self.assertTrue(self.is_element_present(By.CSS_SELECTOR, "div.infowindow h3"),
            msg="Info window did not open")
        self.assertTrue(first_place in driver.find_element_by_css_selector("div.infowindow h3").text,
            msg="Info window title doesn't match timeline title")
    
    def is_element_present(self, how, what):
        try: self.driver.find_element(by=how, value=what)
        except NoSuchElementException, e: return False
        return True
    
    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
